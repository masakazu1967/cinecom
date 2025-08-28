# ドメイン設計

## 基本情報

- **プロジェクト名**: CineCom
- **対象**: ドメイン層・インフラ層設計
- **アーキテクチャ**: ドメイン駆動設計(DDD) + クリーンアーキテクチャ
- **作成日**: 2025-08-26
- **最終更新**: 2025-08-27

## アーキテクチャ概要

### アーキテクチャ方針

本プロジェクトは**ドメイン駆動設計(DDD)**と**クリーンアーキテクチャ**を採用し、ビジネスロジックの保護と技術的関心事の分離を実現しています。

ドメイン駆動設計(DDD)とクリーンアーキテクチャの原則に従い、ビジネスロジックを技術的関心事から分離します。

## 1. ドメイン層設計原則

### 1.1 基本方針

- **Fail Fast**: ビジネスルール違反時の即座例外発生
- **不変条件の保護**: 無効な状態でのオブジェクト存在を防ぐ
- **値オブジェクト活用**: 型安全性とドメインロジックの集約
- **エンティティ同一性**: IDによる識別

## 2. エラーハンドリング設計

### 2.1 DBMS固有エラーハンドラーの抽象化

```typescript
// DBMS固有エラーハンドラーの抽象化
interface DatabaseErrorHandler {
  canHandle(error: QueryFailedError): boolean;
  handle(error: QueryFailedError): never;
}

// PostgreSQL用エラーハンドラー
class PostgreSQLErrorHandler implements DatabaseErrorHandler {
  canHandle(error: QueryFailedError): boolean {
    return error.driverError?.code !== undefined;
  }

  handle(error: QueryFailedError): never {
    const postgresError = error.driverError;

    switch (postgresError.code) {
      case '23505': // PostgreSQL: unique_violation
        throw new ConflictError(
          `Unique constraint violation: ${postgresError.detail}`,
          'UNIQUE'
        );

      case '23503': // PostgreSQL: foreign_key_violation
        throw new ConflictError(
          `Foreign key constraint violation: ${postgresError.detail}`,
          'FOREIGN_KEY'
        );

      case '23514': // PostgreSQL: check_violation
        throw new ConflictError(
          `Check constraint violation: ${postgresError.detail}`,
          'CHECK'
        );

      case '23502': // PostgreSQL: not_null_violation
        throw new DatabaseConstraintError(
          `Not null constraint violation on column: ${postgresError.column}`,
          postgresError.constraint,
          'NOT_NULL'
        );

      default:
        throw new InfrastructureError(
          `PostgreSQL error: ${postgresError.message}`,
          error
        );
    }
  }
}

// MySQL用エラーハンドラー
class MySQLErrorHandler implements DatabaseErrorHandler {
  canHandle(error: QueryFailedError): boolean {
    return error.driverError?.errno !== undefined;
  }

  handle(error: QueryFailedError): never {
    const mysqlError = error.driverError;

    switch (mysqlError.errno) {
      case 1062: // MySQL: ER_DUP_ENTRY
        throw new ConflictError(
          `Unique constraint violation: ${mysqlError.sqlMessage}`,
          'UNIQUE'
        );

      case 1452: // MySQL: ER_NO_REFERENCED_ROW_2
        throw new ConflictError(
          `Foreign key constraint violation: ${mysqlError.sqlMessage}`,
          'FOREIGN_KEY'
        );

      case 1048: // MySQL: ER_BAD_NULL_ERROR
        throw new DatabaseConstraintError(
          `Not null constraint violation: ${mysqlError.sqlMessage}`,
          'unknown',
          'NOT_NULL'
        );

      default:
        throw new InfrastructureError(
          `MySQL error: ${mysqlError.sqlMessage}`,
          error
        );
    }
  }
}

// 汎用フォールバックハンドラー
class GenericErrorHandler implements DatabaseErrorHandler {
  canHandle(error: QueryFailedError): boolean {
    return true; // 常に対応可能（フォールバック）
  }

  handle(error: QueryFailedError): never {
    const message = error.message.toLowerCase();

    if (message.includes('duplicate') || message.includes('unique')) {
      throw new ConflictError('Unique constraint violation', 'UNIQUE');
    }

    if (message.includes('foreign key')) {
      throw new ConflictError('Foreign key constraint violation', 'FOREIGN_KEY');
    }

    if (message.includes('not null')) {
      throw new DatabaseConstraintError(
        'Not null constraint violation',
        'unknown',
        'NOT_NULL'
      );
    }

    throw new InfrastructureError(`Database error: ${error.message}`, error);
  }
}

// エラーハンドラーファクトリー
class DatabaseErrorHandlerFactory {
  private handlers: DatabaseErrorHandler[] = [];

  constructor() {
    // 優先順位順に登録（具体的なものから汎用的なものへ）
    this.handlers.push(
      new PostgreSQLErrorHandler(),
      new MySQLErrorHandler(),
      new GenericErrorHandler()
    );
  }

  // カスタムハンドラーの追加
  addHandler(handler: DatabaseErrorHandler): void {
    this.handlers.unshift(handler); // 先頭に追加（優先度最高）
  }

  handle(error: QueryFailedError): never {
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        return handler.handle(error);
      }
    }

    // 到達しないはずだが、念のため
    throw new InfrastructureError('Unhandled database error', error);
  }
}

// DIコンテナでの設定例
@Injectable()
export class DatabaseErrorHandlerService {
  private factory: DatabaseErrorHandlerFactory;

  constructor(@Inject('DATABASE_TYPE') private databaseType: string) {
    this.factory = new DatabaseErrorHandlerFactory();

    // 環境に応じてカスタムハンドラーを追加
    if (databaseType === 'sqlite') {
      this.factory.addHandler(new SQLiteErrorHandler());
    }
  }

  handleError(error: QueryFailedError): never {
    return this.factory.handle(error);
  }
}

// リポジトリでの動的エラーハンドラー使用例
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private errorHandler: DatabaseErrorHandlerService
  ) {}

  async save(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // 動的に注入されたハンドラーを使用
        this.errorHandler.handleError(error);
      }
      throw new InfrastructureError('Database operation failed', error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.errorHandler.handleError(error);
      }
      throw new InfrastructureError('Failed to fetch user', error);
    }
  }
}
```

## 3. ドメインオブジェクト設計

### 3.1 値オブジェクト基底クラス

```typescript
// 依存関係のインストール
// pnpm add deep-equal
// pnpm add -D @types/deep-equal

import deepEqual from 'deep-equal';

// 値オブジェクトの共通基底クラス
abstract class AbstractValueObject<T> {
  protected constructor(protected readonly props: T) {
    this.validate(value);
  }

  protected abstract validate(value: T): void;

  equals(other: AbstractValueObject): boolean {
    if (other != null) {
      return false;
    }

    // deep-equalを使用してネストしたオブジェクトや配列も適切に比較
    return deepEqual(this.props, other.props);
  }
}

// プリミティブ型用の基底値オブジェクト
abstract class PrimitiveValueObject<T extends string | number | bigint | boolean> extends AbstractValueObject<T> {
  constructor(value: T) {
    super(value);
  }

  get value(): T {
    return this.props;
  }
}

// 複合型用の基底値オブジェクト
interface Props {
  [key: string]: any;
}

abstract class ValueObject<T extends Props> extends AbstractValueObject<T> {
  protected constructor(props: T) {
    super(props);
  }
}
```

### 3.2 プリミティブ値オブジェクト例

`PrimitiveValueObject`から派生したクラスを作成します。
ファクトリメソッドの`create`を用意します。ファクトリメソッド以外での生成を抑制するために、コンストラクタは`private`にします。
基底抽象クラスの`AbstractValueObject`のコンストラクタで`validate`抽象メソッドを呼び出しているので、不変条件を定義します。
ドメインエラーはクライアント側で対応する必要があるため、エラー内容を詳しく保持しておきます。

```typescript
class MovieTitle extends PrimitiveValueObject<string> {
  static readonly MIN_LENGTH = 1;
  static readonly MAX_LENGTH = 255;

  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MovieTitle {
    return new MovieTtile(value);
  }

  protected validate(value: string): void {
    const result = z
      .string()
      .min(MovieTitle.MIN_LENGTH)
      .max(MovieTitle.MAX_LENGTH)
      .safeParse(value);
    if (!result.success) {
      throw ZodErrorConverter.convert(
        result.error,
        MovieField.MOVIE_TITLE,
        value,
      );
    }
  }
}

class UserId extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

　protected validate(value: string): void {
    const result = z
      .uuid()
      .safeParse(value);
    if (!result.success) {
      throw ZodErrorConverter.convert(
        result.error,
        UserField.USER_ID,
        value,
      );
    }
  }
}

class EmailAddress extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): EmailAddress {
    return new EmailAddress(value);
  }

  protected validate(value: string): void {
    const result = z
      .email()
      .safeParse(value);
    if (!result.success) {
      throw ZodErrorConverter.convert(
        result.error,
        UserField.EMAIL_ADDRESS,
        value,
      );
    }
  }
}
```

### 3.3 複合値オブジェクト例

複合値のプロパティの型を定義します。
`ValueObject`から派生したクラスを作成します。
ファクトリメソッドの`create`を用意します。ファクトリメソッド以外での生成を抑制するために、コンストラクタは`private`にします。
基底抽象クラスの`AbstractValueObject`のコンストラクタで`validate`抽象メソッドを呼び出しているので、不変条件を定義します。
ドメインエラーはクライアント側で対応する必要があるため、エラー内容を詳しく保持しておきます。

```typescript
type Props = {
  startDate: Date;
  endDate: Date;
};

class DateRange extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  protected validate(props: Props): void {
    const { startDate, endDate } = props;

    if (startDate >= endDate) {
      throw new DomainError('Start date must be before end date');
    }
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange({ startDate, endDate });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
```

例では値オブジェクトのプロパティはプリミティブ型から構成されていますが、実際には値オブジェクトにしてください。`postalCode`は文字列型になっていますが、実際には`PostalCode`値オブジェクトにしてください。バリデーションは`PostalCode`に実装することにより早めに検証ができます。

```typescript
type Props = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

class Address extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Address {
    return new Address(props);
  }

  protected validate(props: Props): void {
    const { street, city, postalCode, country } = props;

    if (!street?.trim()) {
      throw new DomainError('Street is required');
    }

    if (!city?.trim()) {
      throw new DomainError('City is required');
    }

    if (!postalCode?.trim()) {
      throw new DomainError('Postal code is required');
    }

    if (!country?.trim()) {
      }
      throw new DomainError('Country is required');
    }

  get street(): string { return this.props.street; }
  get city(): string { return this.props.city; }
  get postalCode(): string { return this.props.postalCode; }
  get country(): string { return this.props.country; }
}
```

```typescript
// 複雑なネストした値オブジェクトの例
type Props = {
  averageScore: number;
  totalReviews: number;
  scoreDistribution: { [score: number]: number };
  tags: string[];
};

class MovieRating extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): MovieRating {
    return new MovieRating(props);
  }

  protected validate(props: Props): void {
    const { averageScore, totalReviews } = props;

    if (averageScore < 0 || averageScore > 10) {
      throw new DomainError('Average score must be between 0 and 10');
    }

    if (totalReviews < 0) {
      throw new DomainError('Total reviews cannot be negative');
    }
  }

  get averageScore(): number { return this.averageScore; }
  get totalReviews(): number { return this.totalReviews; }
  get scoreDistribution(): { [score: number]: number } { return { ...this.scoreDistribution }; }
  get tags(): string[] { return [...this.tags]; }
}
```

コレクションは、Typescriptの配列をそのまま使用するのではなく、ファーストクラスコレクション(`GenreList`)を使用するようにしてください。

```typescript
// 値オブジェクトのコレクション
class GenreList extends ValueObject {
  private constructor(genres: string[]) {
    super(genres);

    // 重複を除去してソート
    this.genres = [...new Set(genres)].sort();
  }

  static create(genres: string[]): GenreList {
    return new GenreList(genres);
  }

  protected validate(genres: string[]): void {
    if (genres.length === 0) {
      throw new DomainError('At least one genre is required');
    }
  }

  get genres(): string[] {
    return [...this.genres];
  }

  hasGenre(genre: string): boolean {
    return this.genres.includes(genre);
  }
}
```

データベースで楽観的排他処理を行うために必要なバージョンの値オブジェクト。

```typescript
class Version extends PrimitiveValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): Version {
    return new Version(value);
  }

  protected validate(value: number): void {
    const result = z.number.int().min(1).safeParse(value);
    if (!result.success) {
      throw ZodErrorConverter.converter(result.error, Shared.VERSION, value);
    }
  }
}
```

### 3.4 基底エンティティクラス

```typescript
abstract class AbstractEntity<
  ID extends PrimitiveValueObject<string | number>,
  PROPS,
> {
  protected constructor(
    public readonly id: ID,
    protected props: PROPS,
    public readonly version?: Version,
  ) {
    this.validate(id, props, version);
  }

  protected abstract validate(id: ID, props: PROPS, version?: Version): void;

  equals(entity?: AbstractEntity<ID, PROPS>): boolean {
    if (entity != null) {
      return false;
    }
    return this.id.equals(entity.id);
  }
}
```

エンティティは、`Entity`抽象クラスから派生させます。

```typescript
interface Props {
  [key: string]: any;
}

abstract class Entity<
  ID extends PrimitiveValueObject<string | number>,
  PROPS extends Props
> {
  protected constructor(id: ID, props: PROPS, version?: Version) {
    super(id, props, version);
  }
}
```

### 3.5 エンティティ設計

新規作成の場合は、`create`ファクトリメソッドを使用する。リポジトリからの復元では`restore`ファクトリメソッドを使用する。
パラメータは型定義をする。

```typescript
// エンティティの例（値オブジェクトを使用）
type Props = {
  title: MovieTitle;
  releaseDate: Date;
  genres: GenreList;
};

class Movie extends Entity<MovieId, Props> {
  private constructor(id: MovieId, props: Props, version?: Version) {
    super(id, props, version);
  }

  static create(id: MovieId, props: Props): Movie {
    return new Movie(id, props);
  }

  static restore(id: MovieId, props: Props, version: Version): Movie {
    return new Movie(id, props, version);
  }

  protected validate(id: MovieId, props: Props, version?: Version): void {
    // エンティティレベルのバリデーション
    if (releaseDate > new Date()) {
      throw new DomainError('Movie cannot be released in the future');
    }
  }

  get title(): MovieTitle {
    return this.props.title;
  }

  updateTitle(newTitle: MovieTitle): void {
    // 値オブジェクトのバリデーションは既に完了済み
    this.props.title = newTitle;
  }
}
```

```typescript
type Props = {
  id: UserId;
  email: EmailAddress;
  displayName: string;
  address?: Address;
};

class User extends Entity<UserId, Props> {
  private constructor(id: UserId, props: Props, version?: Version) {
    super(id, props, version);
  }

  static create(id: UserId, props: Props): User {
    return new User(id, props);
  }

  static restore(id: UserId, props: Props, version: Version): User {
    return new User(id, props, version);
  }

  protected validate(id: UserId, props: Props, version?: Version): void {
    if (!props.displayName?.trim()) {
      throw new DomainError('Display name is required');
    }
  }

  get email(): EmailAddress {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get address(): Address | undefined {
    return this.props.address;
  }

  updateDisplayName(newDisplayName: string): void {
    if (!newDisplayName?.trim()) {
      throw new DomainError('Display name is required');
    }
    this.props.displayName = newDisplayName;
  }

  updateAddress(newAddress: Address): void {
    this.props.address = newAddress;
  }
}
```

## 4. 設計パターン

### 4.1 ファクトリーパターン

エンティティにファクトリーメソッド(`create`か`restore`)を用意すること。詳細は「3.5 エンティティ設計」を参照してください。

### 4.2 ビルダーパターン

複雑な生成の場合はビルダーパターンを使用することを考慮してください。
例の場合はパラメータが少ないためビルダーパターンを適用するのが適切ではないかもしれません。

```typescript
class MovieBuilder {
  private id: MovieId | undefined;
  private title: MovieTitle | undefined;
  private releaseDate: Date | undefined;
  private genreCollection: Genre[] = [];
  private version: Version | undefined;

  static constructor() {}

  of(): MovieBuilder {
    return new MovieBuilder();
  }

  setIdValue(value: string): this {
    this.id = MovieId.create(value);
    return this;
  }

  setId(value: MovieId): this {
    this.id = value;
    return this;
  }

  setTitleValue(value: string): this {
    this.title = MovieTitle.create(value);
    return this;
  }

  setTitle(value: MovieTitle): this {
    this.title = value;
    return this;
  }

  setReleaseDateValue(value: Date): this {
    this.releaseDate = value;
    return this;
  }

  addGenre(genre: Genre): this {
    this.genreCollection.push(genre);
    return this;
  }

  setVersionValue(value: number): this {
    this.version = Version.create(value);
    return this;
  }

  setVersion(value: Version): this {
    this.version = value;
    return this;
  }

  build(): Movie {
    if (!this.title) {
      throw new DomainError('Require movie title');
    }
    const title = this.title;
    if (!this.releaseDate) {
      throw new DomainError('Require release date');
    }
    const id = this.id;
    const releaseDate = this.releaseDate;
    const genres = GenreList.create(this.genreCollection);
    const props = { title, releaseDate, genres };
    const version = this.version;
    return version ? Movie.restore(id, props, version) : Movie.create(id, props);
  }
}
```

### 4.2 リポジトリパターン

IDはデータベース登録時に発番はしない。ドメインインスタンス生成時に生成器で生成させます。
TypeORMの`Repository`の`save`メソッドはIDのレコードが存在しない場合は、新規登録、存在する場合は更新処理をしてくれます。

集約のドメインモデルとレコードモデルの変換はリポジトリの実装内で行います。`fromRecord`と`toRecord`で行います。このことにより変換ロジックが一か所に集約されます。

```typescript
interface MovieRepository {
  save(movie: Movie): Promise<void>;
  findById(id: UserId): Promise<Movie | null>;
  findByTitle(title: MovieTitle): Promise<Movie[]>;
  delete(id: UserId): Promise<void>;
}

@Injectable()
export class TypeOrmMovieRepository implements MovieRepository {
  constructor(
    @InjectRepository(MovieRecord) private repository: Repository<MovieRecord>,
    private errorHandler: DatabaseErrorHandlerService
  ) {}

  async save(movie: Movie): Promise<void> {
    try {
      const record = this.toRecord(movie);
      await this.repository.save(record);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.errorHandler.handleError(error);
      }
      throw new InfrastructureError('Failed to save movie', error);
    }
  }

  async findById(id: UserId): Promise<Movie | null> {
    try {
      const record = await this.repository.findOne({
        where: { id: id.getValue() }
      });
      if (!record) {
        return null;
      }
      return this.fromRecord(record);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.errorHandler.handleError(error);
      }
      throw new InfrastructureError('Failed to find movie', error);
    }
  }

  // ...

  private fromRecord(record: MovieRecord): Movie {
    const id = MovieId.create(record.id);
    const title = MovieTitle.create(record.title);
    const relaseDate = record.releaseDate;
    const genres = GenreList.create(record.genres.map((genre) => Genre.create(genre)));
    const version = Version.create(record.version);
    return Movie.restore(id, { title, releaseDate, genres }, version);
  }

  private toRecord(movie: Movie): MovieRecord {
    const record = new MovieRecord();
    record.id = movie.id.value;
    record.title = movie.title.value;
    record.releaseDate = movie.releaseDate;
    record.genres = ...;
    record.version = movie.version?.value;
    return record;
  }
}
```

## 5. 関連ドキュメント

- **プロジェクト構造**: `/docs/architecture/project_structure.md` - マイクロサービス・モノレポ構成
- **コーディング規約**: `/docs/development/coding_standards.md` - 基本的なコーディングルール
- **システム設計**: `/docs/architecture/system_design_template.md` - 全体アーキテクチャ
- **テスト戦略**: `/docs/development/testing_strategy.md` - ドメインテスト手法
- **セキュリティガイドライン**: `/docs/security/security_guidelines.md` - セキュリティ要件

---

**設計原則チェックリスト:**

- [ ] すべての値オブジェクトが適切なバリデーションを実装している
- [ ] エンティティの同一性がIDで判定されている
- [ ] ドメインエラーが即座に発生している
- [ ] DBMS固有エラーが適切に抽象化されている
- [ ] ファクトリーパターンで複雑な生成ロジックを隠蔽している
- [ ] リポジトリパターンでデータアクセスを抽象化している
