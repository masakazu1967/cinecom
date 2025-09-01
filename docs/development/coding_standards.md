# コーディング規約

## 基本情報

- **プロジェクト名**: CineCom
- **対象言語**: TypeScript, JavaScript, SQL, CSS
- **作成日**:
- **最終更新**:

## 1. 全般的な原則

### 1.1 基本方針

- **可読性重視**: コードは書かれるより読まれることが多い
- **一貫性**: プロジェクト全体で統一されたスタイル
- **保守性**: 変更しやすく、拡張しやすいコード
- **テスタビリティ**: テストしやすいコード構造

### 1.2 品質指標

- **ESLint違反**: 0件
- **TypeScript エラー**: 0件
- **テストカバレッジ**: 80%以上
- **SonarQube品質ゲート**: 通過必須

## 2. TypeScript/JavaScript 規約

### 2.1 命名規則

#### 変数・関数名

```typescript
// 良い例: camelCase
const userName = 'john_doe';
const calculateTotalPrice = (items: Item[]) => { ... };

// 悪い例: snake_case, PascalCase（関数以外）
const user_name = 'john_doe'; // NG
const UserName = 'john_doe';  // NG（定数でない限り）
```

#### 定数

```typescript
// 良い例: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Enumも同様
enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}
```

#### クラス・インターフェース・型

```typescript
// 良い例: PascalCase
class UserService { ... }
interface MovieDetails { ... }
type ApiResponse<T> = { ... };

// インターフェースには接頭辞を付けない
interface UserRepository { ... }  // 良い
interface IUserRepository { ... } // 悪い
```

### 2.2 ファイル・ディレクトリ命名

- ディレクトリ名はケバブケース
- マークダウンのファイル名はスネークケース
- Typescriptのファイル名はパスカルケース

```bash
// ファイル名: 定義する名前と同じ（PascalCase）
UserService.ts        // class UserService
MovieDetails.tsx      // MovieDetails コンポーネント
ApiClient.ts          // class ApiClient
ApiTypes.ts           // type ApiTypes やその他のtype定義
ValidationUtils.ts    // validateEmail などのユーティリティ関数
AppConfig.ts          // APP_CONFIG などの定数

// ディレクトリ名: kebab-case
src/
├── components/
├── services/
├── utils/
├── types/
└── test-helpers/

// ドキュメントファイル名: snake_case（プロジェクト統一）
docs/
├── project/
│   ├── requirements_analysis.md    // 既存ファイルとの整合性
│   └── project_charter.md         // 既存ファイルとの整合性
├── development/
│   ├── coding_standards.md        // 既存ファイルとの整合性
│   └── testing_strategy.md        // 既存ファイルとの整合性

注意: 新規ドキュメント作成時はsnake_caseを使用（プロジェクト全体での一貫性維持）

// ファイル構成例:
src/
├── services/
│   ├── UserService.ts        // class UserService
│   ├── MovieService.ts       // class MovieService
│   └── ApiClient.ts          // class ApiClient
├── components/
│   ├── MovieCard.tsx         // MovieCard コンポーネント
│   └── UserProfile.tsx       // UserProfile コンポーネント
├── types/
│   ├── ApiTypes.ts           // type ApiResponse, ApiError など
│   └── UserTypes.ts          // type User, UserRole など
├── utils/
│   ├── ValidationUtils.ts    // validateEmail, validatePassword など
│   └── DateUtils.ts          // formatDate, parseDate など
└── constants/
    ├── AppConfig.ts          // APP_CONFIG, API_BASE_URL など
    └── ErrorMessages.ts      // ERROR_MESSAGES など
```

### 2.3 import/export 規約

#### import順序

```typescript
// 1. Node.jsモジュール
import fs from 'fs';
import path from 'path';

// 2. 外部ライブラリ
import React from 'react';
import { Injectable } from '@nestjs/common';

// 3. 内部モジュール（絶対パス）
import { UserService } from '@/services/user.service';
import { ApiResponse } from '@/types/api.types';

// 4. 相対パス
import './component.styles.css';
import { validateInput } from '../utils/validation';
```

#### export規約

```typescript
// 名前付きエクスポート推奨
export const UserService = { ... };
export const validateEmail = (email: string) => { ... };

// デフォルトエクスポートは限定的に使用
export default class UserRepository { ... } // コンポーネント・クラスのみ

// re-export
export { UserService } from './user.service';
export type { User, UserRole } from './user.types';
```

### 2.4 型定義

#### 基本的な型使用

```typescript
// Primitiveな型を明確に
const id: string = 'uuid-v4';
const count: number = 42;
const isActive: boolean = true;

// Union型の活用
type Status = 'pending' | 'approved' | 'rejected';
type UserId = string; // 型エイリアスで意図を明確に

// 配列型
const userIds: string[] = []; // または Array<string>
const users: User[] = [];
```

#### インターフェース定義

```typescript
// 良い例: 必須・オプションの明確化
interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  avatar?: string; // オプショナル
}

// readonly修飾子の活用
interface User {
  readonly id: string;
  readonly createdAt: Date;
  email: string;
  displayName: string;
}

// Generic型の活用
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: Date;
}
```

#### 型ガード

```typescript
// 型ガード関数
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

// 使用例
if (isUser(data)) {
  // この時点でdataはUser型として扱える
  console.log(data.email);
}
```

### 2.5 関数定義

#### 関数形式の統一

```typescript
// Arrow function推奨（短い関数）
const add = (a: number, b: number): number => a + b;

// 複雑なロジックは通常の関数
function calculateTotalPrice(
  items: CartItem[],
  discountRate?: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discount = discountRate ? subtotal * discountRate : 0;
  return subtotal - discount;
}

// 非同期関数
const fetchUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

#### 引数の扱い

```typescript
// 多数の引数はオブジェクトで
// 悪い例
function createUser(email: string, password: string, name: string, avatar: string, role: string) { ... }

// 良い例
interface CreateUserParams {
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
  role?: UserRole;
}

function createUser(params: CreateUserParams): Promise<User> { ... }
```

### 2.6 エラーハンドリング

#### エラーハンドリング戦略（全層統一）

```yaml
基本方針:
  全層で例外による一貫したエラーハンドリング
  Result型は使用せず、シンプルで標準的なアプローチ

ドメイン層:
  戦略: 即座例外発生（Fail Fast）
  対象: ビジネスルール違反・不変条件違反
  目的: 無効な状態での動作継続を防ぐ
  実装: DomainError でthrow

アプリケーション層:
  戦略: 例外ハンドリング
  対象: 入力検証・ユースケース実行エラー
  目的: ビジネス例外の適切な変換・伝播
  実装: ApplicationError でthrow

インフラ層:
  戦略: 例外ハンドリング
  対象: データアクセス・ネットワークエラー
  目的: 技術的エラーの適切な変換
  実装: InfrastructureError でthrow

プレゼンテーション層:
  戦略: HTTPステータス変換
  対象: 全層からのエラー
  目的: 適切なHTTPレスポンス
  実装: Exception Filter による変換
```

```typescript
// カスタムエラークラス（層別に定義）

// ドメイン層のエラー（ビジネスルール違反・不変条件違反）
class DomainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// アプリケーション層のエラー（ユースケース実行・入力検証）
class ApplicationError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, public field: string, public code: string) {
    super(message, code);
    // this.name の設定は不要（親クラスで自動設定）
  }
}

// インフラ層のエラー（データアクセス・外部API）
class InfrastructureError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

class NotFoundError extends InfrastructureError {
  constructor(message: string) {
    super(message);
    // this.name の設定は不要（親クラスで自動設定）
  }
}

class ConflictError extends InfrastructureError {
  constructor(message: string, public conflictType: 'UNIQUE' | 'FOREIGN_KEY' | 'CHECK' = 'UNIQUE') {
    super(message);
    // this.name の設定は不要（親クラスで自動設定）
  }
}

class DatabaseConstraintError extends InfrastructureError {
  constructor(
    message: string,
    public constraintName: string,
    public constraintType: 'UNIQUE' | 'FOREIGN_KEY' | 'CHECK' | 'NOT_NULL'
  ) {
    super(message);
    // this.name の設定は不要（親クラスで自動設定）
  }
}

// アプリケーション層での例外ハンドリング
async function validateUserInApplicationLayer(data: unknown): Promise<User> {
  try {
    // 外部ライブラリ（Joi等）のバリデーション
    const user = await userSchema.validateAsync(data);
    return user;
  } catch (error) {
    // ライブラリエラーをアプリケーションエラーに変換
    if (error.isJoi) {
      throw new ValidationError(
        'Invalid user data',
        error.details[0].path[0],
        'VALIDATION_FAILED'
      );
    }
    throw new ApplicationError('User validation failed', 'VALIDATION_ERROR');
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

DBMS固有エラーハンドラーやドメインオブジェクト設計の詳細については [ドメイン設計](../architecture/domain_design.md) を参照してください。
```

### 2.7 非同期処理

```typescript
// async/await推奨
async function fetchMovieDetails(id: string): Promise<Movie> {
  try {
    const response = await fetch(`/api/movies/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch movie:', error);
    throw error;
  }
}

// 並列処理
const fetchUserData = async (userId: string) => {
  const [user, profile, reviews] = await Promise.all([
    fetchUser(userId),
    fetchProfile(userId),
    fetchUserReviews(userId)
  ]);

  return { user, profile, reviews };
};
```

## 3. React/Next.js 規約

### 3.1 コンポーネント定義

```tsx
// 関数コンポーネント（React 18+推奨記法）
interface MovieCardProps {
  movie: Movie;
  onRate?: (rating: number) => void;
  className?: string;
}

export const MovieCard = ({
  movie,
  onRate,
  className = ''
}: MovieCardProps) => {
  return (
    <div className={`movie-card ${className}`}>
      <h2>{movie.title}</h2>
      {onRate && (
        <StarRating
          value={movie.rating}
          onChange={onRate}
        />
      )}
    </div>
  );
};

// または型推論を活用した記法
export function MovieCard({
  movie,
  onRate,
  className = ''
}: MovieCardProps) {
  return (
    <div className={`movie-card ${className}`}>
      <h2>{movie.title}</h2>
      {onRate && (
        <StarRating
          value={movie.rating}
          onChange={onRate}
        />
      )}
    </div>
  );
}
```

### 3.2 Hooks使用規約

```tsx
// カスタムHooks
export const useMovieSearch = (query: string) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    const searchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await movieService.search(query);
        setMovies(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMovies, 300); // デバウンス
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { movies, loading, error };
};
```

## 4. NestJS/Backend 規約

### 4.1 コントローラー

```typescript
@Controller('movies')
@ApiTags('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: '映画一覧を取得' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() query: GetMoviesQueryDto
  ): Promise<PaginatedResponse<Movie>> {
    return this.moviesService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: '映画を作成' })
  @ApiBody({ type: CreateMovieDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async create(
    @Body() createMovieDto: CreateMovieDto
  ): Promise<Movie> {
    // プレゼンテーション層のDTOをアプリケーション層のコマンドに変換
    const createMovieCommand = {
      title: createMovieDto.title,
      description: createMovieDto.description,
      releaseDate: new Date(createMovieDto.releaseDate),
      genreIds: createMovieDto.genreIds
    };

    // アプリケーション層からのエラーをそのまま受け取り
    // Exception Filterで適切なHTTPステータスに変換される
    return this.moviesService.create(createMovieCommand);
  }
}
```

Exception Filter等のインフラ設定については [インフラ設定ガイド](../operations/infrastructure_setup.md) を参照してください。

### 4.2 サービス層

```typescript
// アプリケーション層のコマンド型定義
interface CreateMovieCommand {
  title: string;
  description?: string;
  releaseDate: Date;
  genreIds: string[];
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly cacheService: CacheService
  ) {}

  // アプリケーション層でコマンドを受け取る
  async create(command: CreateMovieCommand): Promise<Movie> {
    // 入力検証（アプリケーション層の責務）
    if (!command.title?.trim()) {
      throw new ValidationError('Title is required', 'title', 'REQUIRED');
    }

    if (!command.genreIds?.length) {
      throw new ValidationError('At least one genre is required', 'genreIds', 'REQUIRED');
    }

    try {
      // ドメインオブジェクト作成（ドメイン層で不変条件チェック）
      // DomainErrorが発生した場合はそのまま伝播
      const movie = new Movie({
        title: command.title,
        description: command.description,
        releaseDate: command.releaseDate,
        genreIds: command.genreIds
      });

      // インフラ層への永続化
      // InfrastructureErrorが発生した場合はそのまま伝播
      return await this.movieRepository.save(movie);

    } catch (error) {
      // ドメインエラーやインフラエラーはプレゼンテーション層に直接伝播
      if (error instanceof DomainError || error instanceof InfrastructureError) {
        throw error;
      }

      // 予期しないエラーのみアプリケーションエラーに変換
      throw new ApplicationError(
        'Failed to create movie due to unexpected error',
        'CREATE_FAILED',
        { originalError: error.message }
      );
    }
  }

  async findAll(query: GetMoviesQueryDto): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<PaginatedResponse<Movie>>(cacheKey);

    if (cached) {
      return cached;
    }

    const queryBuilder = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .where('movie.isPublished = :isPublished', { isPublished: true });

    if (query.genre) {
      queryBuilder.andWhere('genre.slug = :genre', { genre: query.genre });
    }

    const [movies, total] = await queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    const result = {
      items: movies,
      pagination: {
        currentPage: query.page,
        totalPages: Math.ceil(total / query.limit),
        totalItems: total,
        itemsPerPage: query.limit
      }
    };

    await this.cacheService.set(cacheKey, result, 300); // 5分キャッシュ
    return result;
  }
}
```

### 4.3 DTO定義

```typescript
export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '映画タイトル' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'あらすじ', required: false })
  description?: string;

  @IsDateString()
  @ApiProperty({ description: '公開日' })
  releaseDate: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({ description: 'ジャンルIDの配列', type: [String] })
  genreIds: string[];
}

export class GetMoviesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'ページ番号', default: 1, required: false })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ description: '1ページあたりの件数', default: 20, required: false })
  limit: number = 20;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'ジャンルスラッグ', required: false })
  genre?: string;
}
```

## 5. データベース/SQL 規約

### 5.1 テーブル・カラム命名

```sql
-- テーブル名: 複数形、snake_case
CREATE TABLE movies (...);
CREATE TABLE user_profiles (...);
CREATE TABLE movie_genres (...); -- 中間テーブル

-- カラム名: 単数形、snake_case
CREATE TABLE movies (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 外部キー: テーブル名_id
user_id UUID REFERENCES users(id),
movie_id UUID REFERENCES movies(id)
```

### 5.2 インデックス命名

```sql
-- 通常のインデックス: idx_テーブル名_カラム名
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);

-- 複合インデックス: idx_テーブル名_カラム1_カラム2
CREATE INDEX idx_reviews_user_movie ON reviews(user_id, movie_id);

-- ユニークインデックス: uk_テーブル名_カラム名
CREATE UNIQUE INDEX uk_users_email ON users(email);
```

### 5.3 クエリ記述

```sql
-- SELECT文の整形
SELECT
    m.id,
    m.title,
    m.release_date,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as review_count
FROM movies m
LEFT JOIN reviews r ON m.id = r.movie_id
WHERE
    m.is_published = TRUE
    AND m.release_date >= '2020-01-01'
GROUP BY m.id, m.title, m.release_date
HAVING COUNT(r.id) >= 5
ORDER BY average_rating DESC, review_count DESC
LIMIT 20;

-- UPDATE文
UPDATE movies
SET
    title = $1,
    description = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $3
    AND is_published = TRUE;
```

## 6. CSS/Styling 規約

### 6.1 クラス命名（BEM風）

```css
/* Block__Element--Modifier */
.movie-card { }
.movie-card__title { }
.movie-card__rating { }
.movie-card__rating--high { }

/* ユーティリティクラス */
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.btn { /* 基本ボタンスタイル */ }
.btn--primary { /* プライマリボタン */ }
```

### 6.2 CSS変数活用

```css
:root {
  /* カラーパレット */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-error: #dc3545;

  /* スペーシング */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;

  /* フォント */
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
```

## 7. コメント・ドキュメンテーション

### 7.1 コメント規約

```typescript
/**
 * 映画の評価を計算する
 *
 * @param reviews - レビューの配列
 * @param weights - 評価の重み付け設定（オプション）
 * @returns 計算された平均評価（1-10の範囲）
 *
 * @example
 * ```typescript
 * const rating = calculateAverageRating(reviews, { recent: 1.2 });
 * console.log(rating); // 8.5
 * ```
 */
function calculateAverageRating(
  reviews: Review[],
  weights?: RatingWeights
): number {
  // 空配列の場合は0を返す
  if (reviews.length === 0) {
    return 0;
  }

  // TODO: 重み付け計算の実装を改善
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 100) / 100;
}
```

### 7.2 README/ドキュメント

<!-- markdownlint-disable MD040 -->

```markdown
# MovieService

映画データの CRUD 操作を提供するサービスクラス

## 使用方法

```typescript
const movieService = new MovieService(movieRepository);

// 映画作成
const movie = await movieService.create({
  title: 'インターステラー',
  description: 'SF映画の傑作',
  genreIds: ['sci-fi-uuid']
});

// 映画検索
const results = await movieService.search({
  query: 'インター',
  page: 1,
  limit: 20
});
```

## API

### `create(data: CreateMovieDto): Promise<Movie>`

新しい映画を作成します。

**パラメータ:**

- `data` - 作成する映画の情報

**戻り値:**
作成された映画オブジェクト

**例外:**

- `ValidationError` - データが無効な場合
- `ConflictError` - 映画が既に存在する場合

```
<!-- markdownlint-enable MD040 -->

テスト規約の詳細については [テスト戦略](testing_strategy.md) を参照してください。
```

セキュリティ要件については [セキュリティガイドライン](../security/security_guidelines.md) を参照してください。

パフォーマンス要件については [パフォーマンス最適化ガイドライン](../operations/performance_optimization.md) を参照してください。

---

**コーディング規約チェックリスト:**

- [ ] ESLint・Prettierの設定が完了している
- [ ] 型定義がすべて適切に設定されている
- [ ] エラーハンドリングが適切に実装されている
- [ ] セキュリティ要件が満たされている
- [ ] パフォーマンス要件が考慮されている
- [ ] テストカバレッジが基準を満たしている
- [ ] ドキュメント・コメントが適切に記載されている
