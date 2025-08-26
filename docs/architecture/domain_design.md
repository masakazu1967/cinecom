# ドメイン設計

## 基本情報

- **プロジェクト名**: CineCom
- **対象**: ドメイン層・インフラ層設計
- **作成日**: 2025-08-26
- **最終更新**: 2025-08-26

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
abstract class AbstractValueObject {
  protected abstract getEqualityComponents(): any[];

  equals(other: AbstractValueObject): boolean {
    if (this.constructor !== other.constructor) {
      return false;
    }

    const thisComponents = this.getEqualityComponents();
    const otherComponents = other.getEqualityComponents();

    // deep-equalを使用してネストしたオブジェクトや配列も適切に比較
    return deepEqual(thisComponents, otherComponents);
  }
}

// プリミティブ型用の基底値オブジェクト
abstract class PrimitiveValueObject<T> extends AbstractValueObject {
  constructor(protected readonly value: T) {
    super();
    this.validate(value);
  }

  protected abstract validate(value: T): void;

  getValue(): T {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  protected getEqualityComponents(): any[] {
    return [this.value];
  }
}

// 複合型用の基底値オブジェクト
abstract class ValueObject extends AbstractValueObject {
  // getEqualityComponents()の実装は具象クラスに委譲
}
```

### 3.2 プリミティブ値オブジェクト例

```typescript
class MovieTitle extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new DomainError('Movie title cannot be empty');
    }
    
    if (value.length > 255) {
      throw new DomainError('Movie title cannot exceed 255 characters');
    }
  }
}

class UserId extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    // UUIDフォーマットの検証
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new DomainError('Invalid user ID format');
    }
  }
}

class EmailAddress extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new DomainError('Invalid email address format');
    }
    
    if (value.length > 254) {
      throw new DomainError('Email address too long');
    }
  }
}
```

### 3.3 複合値オブジェクト例

```typescript
class DateRange extends ValueObject {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    super();
    
    if (startDate >= endDate) {
      throw new DomainError('Start date must be before end date');
    }
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  protected getEqualityComponents(): any[] {
    return [this.startDate.getTime(), this.endDate.getTime()];
  }
}

class Address extends ValueObject {
  constructor(
    private readonly street: string,
    private readonly city: string,
    private readonly postalCode: string,
    private readonly country: string
  ) {
    super();
    
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
      throw new DomainError('Country is required');
    }
  }

  getStreet(): string { return this.street; }
  getCity(): string { return this.city; }
  getPostalCode(): string { return this.postalCode; }
  getCountry(): string { return this.country; }

  protected getEqualityComponents(): any[] {
    return [this.street, this.city, this.postalCode, this.country];
  }
}

// 複雑なネストした値オブジェクトの例
class MovieRating extends ValueObject {
  constructor(
    private readonly averageScore: number,
    private readonly totalReviews: number,
    private readonly scoreDistribution: { [score: number]: number },
    private readonly tags: string[]
  ) {
    super();
    
    if (averageScore < 0 || averageScore > 10) {
      throw new DomainError('Average score must be between 0 and 10');
    }
    
    if (totalReviews < 0) {
      throw new DomainError('Total reviews cannot be negative');
    }
  }

  getAverageScore(): number { return this.averageScore; }
  getTotalReviews(): number { return this.totalReviews; }
  getScoreDistribution(): { [score: number]: number } { return { ...this.scoreDistribution }; }
  getTags(): string[] { return [...this.tags]; }

  protected getEqualityComponents(): any[] {
    // deep-equalにより、オブジェクトと配列が適切に比較される
    return [
      this.averageScore, 
      this.totalReviews, 
      this.scoreDistribution, 
      this.tags.sort() // 順序を統一
    ];
  }
}

// 値オブジェクトのコレクション
class GenreList extends ValueObject {
  constructor(private readonly genres: string[]) {
    super();
    
    if (genres.length === 0) {
      throw new DomainError('At least one genre is required');
    }
    
    // 重複を除去してソート
    this.genres = [...new Set(genres)].sort();
  }

  getGenres(): string[] {
    return [...this.genres];
  }

  hasGenre(genre: string): boolean {
    return this.genres.includes(genre);
  }

  protected getEqualityComponents(): any[] {
    // 配列の深い比較がdeep-equalで適切に処理される
    return [this.genres];
  }
}
```

### 3.4 エンティティ設計

```typescript
// エンティティの例（値オブジェクトを使用）
class Movie {
  constructor(
    private readonly id: UserId,
    private title: MovieTitle,
    private readonly releaseDate: Date,
    private readonly genres: Genre[]
  ) {
    // エンティティレベルのバリデーション
    if (releaseDate > new Date()) {
      throw new DomainError('Movie cannot be released in the future');
    }
    
    if (genres.length === 0) {
      throw new DomainError('Movie must have at least one genre');
    }
  }

  getId(): UserId {
    return this.id;
  }

  getTitle(): MovieTitle {
    return this.title;
  }

  updateTitle(newTitle: MovieTitle): void {
    // 値オブジェクトのバリデーションは既に完了済み
    this.title = newTitle;
  }

  equals(other: Movie): boolean {
    // エンティティの同一性はIDで判定
    return this.id.equals(other.id);
  }
}

class User {
  constructor(
    private readonly id: UserId,
    private readonly email: EmailAddress,
    private displayName: string,
    private address?: Address
  ) {
    if (!displayName?.trim()) {
      throw new DomainError('Display name is required');
    }
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): EmailAddress {
    return this.email;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getAddress(): Address | undefined {
    return this.address;
  }

  updateDisplayName(newDisplayName: string): void {
    if (!newDisplayName?.trim()) {
      throw new DomainError('Display name is required');
    }
    this.displayName = newDisplayName;
  }

  updateAddress(newAddress: Address): void {
    this.address = newAddress;
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
```

## 4. 設計パターン

### 4.1 ファクトリーパターン

```typescript
class MovieFactory {
  static create(params: {
    title: string;
    description?: string;
    releaseDate: Date;
    genreIds: string[];
  }): Movie {
    const movieTitle = new MovieTitle(params.title);
    const userId = new UserId(generateUuid());
    
    return new Movie(
      userId,
      movieTitle,
      params.releaseDate,
      params.genreIds.map(id => new GenreId(id))
    );
  }
}
```

### 4.2 リポジトリパターン

```typescript
interface MovieRepository {
  save(movie: Movie): Promise<Movie>;
  findById(id: UserId): Promise<Movie | null>;
  findByTitle(title: MovieTitle): Promise<Movie[]>;
  delete(id: UserId): Promise<void>;
}

@Injectable()
export class MovieRepositoryImpl implements MovieRepository {
  constructor(
    @InjectRepository(Movie) private repository: Repository<Movie>,
    private errorHandler: DatabaseErrorHandlerService
  ) {}

  async save(movie: Movie): Promise<Movie> {
    try {
      return await this.repository.save(movie);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.errorHandler.handleError(error);
      }
      throw new InfrastructureError('Failed to save movie', error);
    }
  }

  async findById(id: UserId): Promise<Movie | null> {
    try {
      return await this.repository.findOne({ 
        where: { id: id.getValue() } 
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.errorHandler.handleError(error);
      }
      throw new InfrastructureError('Failed to find movie', error);
    }
  }
}
```

## 5. 関連ドキュメント

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