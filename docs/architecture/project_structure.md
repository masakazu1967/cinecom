# プロジェクト構造設計

## 基本情報

- **プロジェクト名**: CineCom
- **対象**: マイクロサービス・モノレポ構成
- **アーキテクチャ**: NestJS + 共有パッケージ
- **作成日**: 2025-08-28
- **最終更新**: 2025-08-28

## アーキテクチャ概要

### 構成方針

本プロジェクトは**マイクロサービス**と**モノレポ**を組み合わせた構成を採用し、コードの再利用性とサービスの独立性を両立しています。

#### 基本構成

```text
cinecom/
├── backend/                     # NestJS マイクロサービス
│   ├── actor-service/
│   │   ├── rest-api/           # REST API エントリポイント
│   │   └── graphql/            # GraphQL API エントリポイント
│   ├── movie-service/
│   │   ├── rest-api/
│   │   └── graphql/
│   ├── review-service/
│   │   ├── rest-api/
│   │   └── graphql/
│   ├── scene-service/
│   │   ├── rest-api/
│   │   └── graphql/
│   └── user-service/
│       ├── rest-api/
│       └── graphql/
├── packages/
│   ├── core/                   # ドメイン + アプリケーション層
│   │   ├── actor/              # 俳優ドメイン
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   ├── services/
│   │   │   │   └── repositories/ # インターfaces
│   │   │   └── application/
│   │   │       ├── usecases/
│   │   │       ├── services/
│   │   │       └── dto/
│   │   ├── movie/              # 映画ドメイン
│   │   ├── review/             # レビュードメイン
│   │   ├── scene/              # シーンドメイン
│   │   ├── user/               # ユーザードメイン
│   │   └── shared/             # 共通ドメイン
│   │       ├── domain/
│   │       │   ├── value-objects/
│   │       │   ├── services/
│   │       │   └── errors/
│   │       └── application/
│   │           ├── common/
│   │           └── interfaces/
│   └── infrastructure/         # インフラストラクチャ層
│       ├── actor/
│       │   ├── typeorm/        # PostgreSQL/MySQL実装
│       │   ├── redis/          # キャッシュ実装
│       │   └── s3/            # ファイルストレージ実装
│       ├── movie/
│       │   ├── typeorm/
│       │   ├── redis/
│       │   └── s3/
│       ├── review/
│       │   ├── typeorm/
│       │   ├── redis/
│       │   └── s3/
│       ├── scene/
│       │   ├── typeorm/
│       │   ├── redis/
│       │   └── s3/
│       └── user/
│           ├── typeorm/
│           ├── redis/
│           └── s3/
└── frontend/                   # Next.js フロントエンド
    └── src/
```

## NestJS モジュールアーキテクチャ

各マイクロサービスはNestJSの依存性注入システムを活用してクリーンアーキテクチャを実現します。

### サービス内モジュール構成

```text
backend/movie-service/
├── rest-api/
│   ├── src/
│   │   ├── AppModule.ts            # ルートモジュール
│   │   ├── controllers/            # REST APIコントローラー
│   │   │   └── MovieController.ts
│   │   ├── modules/                # 機能別モジュール
│   │   │   ├── MovieModule.ts      # 映画モジュール
│   │   │   └── InfrastructureModule.ts # インフラモジュール
│   │   └── main.ts                 # エントリポイント
│   ├── package.json
│   └── tsconfig.json
└── graphql/
    ├── src/
    │   ├── AppModule.ts            # GraphQL用ルートモジュール
    │   ├── resolvers/              # GraphQLリゾルバー
    │   │   └── MovieResolver.ts
    │   ├── schemas/                # GraphQLスキーマ
    │   │   └── MovieSchema.ts
    │   └── main.ts
    ├── package.json
    └── tsconfig.json
```

### モジュール依存関係の例

```typescript
// backend/movie-service/rest-api/src/modules/MovieModule.ts
@Module({
  imports: [
    // coreパッケージのドメインモジュールをインポート
    CoreMovieModule,
    // infrastructureパッケージの実装モジュールをインポート  
    InfrastructureMovieTypeOrmModule,
    InfrastructureMovieRedisModule,
    InfrastructureMovieS3Module,
  ],
  controllers: [MovieController],
  providers: [
    // アプリケーションサービスをDI
    {
      provide: 'MovieApplicationService',
      useClass: MovieApplicationService,
    },
    // ドメインサービスをDI
    {
      provide: 'MovieDomainService', 
      useClass: MovieDomainService,
    },
  ],
})
export class MovieModule {}
```

### 共通パッケージの活用

```typescript
// packages/core/movie/src/MovieModule.ts
@Module({
  imports: [SharedModule], // 共通ドメインモジュール
  providers: [
    // ドメインサービス
    MovieDomainService,
    // アプリケーションサービス  
    MovieApplicationService,
    // リポジトリインターface（実装は各サービスで注入）
    {
      provide: 'MovieRepository',
      useFactory: () => {
        throw new Error('MovieRepository must be provided by infrastructure layer');
      },
    },
  ],
  exports: [
    MovieDomainService,
    MovieApplicationService,
    'MovieRepository',
  ],
})
export class CoreMovieModule {}
```

## Core ドメインモジュール構造

### ドメイン別パッケージ構成

各ドメイン（actor, movie, review, scene, user）は独立したパッケージとして構成されます。

```text
packages/core/movie/
├── src/
│   ├── domain/                     # ドメイン層
│   │   ├── entities/
│   │   │   ├── MovieEntity.ts      # 映画エンティティ
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── MovieId.ts          # 映画ID値オブジェクト
│   │   │   ├── MovieTitle.ts       # 映画タイトル値オブジェクト
│   │   │   ├── GenreList.ts        # ジャンルリスト値オブジェクト
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── MovieDomainService.ts # ドメインサービス
│   │   │   └── index.ts
│   │   ├── repositories/           # リポジトリインターface
│   │   │   ├── MovieRepository.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── application/                # アプリケーション層
│   │   ├── usecases/
│   │   │   ├── CreateMovieUseCase.ts
│   │   │   ├── UpdateMovieUseCase.ts
│   │   │   ├── FindMovieUseCase.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── MovieApplicationService.ts
│   │   │   └── index.ts
│   │   ├── dto/                    # データ転送オブジェクト
│   │   │   ├── CreateMovieDto.ts
│   │   │   ├── UpdateMovieDto.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── MovieModule.ts              # NestJSモジュール定義
│   └── index.ts                    # パッケージエクスポート
├── package.json
└── tsconfig.json
```

### 共通ドメインモジュール

```text
packages/core/shared/
├── src/
│   ├── domain/
│   │   ├── value-objects/
│   │   │   ├── Version.ts          # バージョン管理用
│   │   │   ├── EmailAddress.ts     # 共通メールアドレス
│   │   │   ├── DateRange.ts        # 日付範囲
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── IdGeneratorService.ts # ID生成サービス
│   │   │   └── index.ts
│   │   ├── errors/                 # ドメインエラー
│   │   │   ├── DomainError.ts
│   │   │   ├── ValidationError.ts
│   │   │   └── index.ts
│   │   └── base/                   # 基底クラス
│   │       ├── EntityBase.ts
│   │       ├── ValueObjectBase.ts
│   │       └── index.ts
│   ├── application/
│   │   ├── common/
│   │   │   ├── Pagination.ts
│   │   │   ├── Sort.ts
│   │   │   └── index.ts
│   │   └── interfaces/
│   │   │       ├── UseCaseInterface.ts
│   │       └── index.ts
│   ├── SharedModule.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### ドメイン間の依存関係

```typescript
// packages/core/review/src/ReviewModule.ts
@Module({
  imports: [
    SharedModule,           // 共通ドメイン
    CoreMovieModule,        // 映画ドメイン（レビュー対象）
    CoreUserModule,         # ユーザードメイン（レビュー作成者）
  ],
  providers: [
    ReviewDomainService,
    ReviewApplicationService,
    // リポジトリインターface
    {
      provide: 'ReviewRepository',
      useFactory: () => {
        throw new Error('ReviewRepository must be provided');
      },
    },
  ],
  exports: [
    ReviewDomainService,
    ReviewApplicationService,
    'ReviewRepository',
  ],
})
export class CoreReviewModule {}
```

## Infrastructure 層構成

### 技術スタック別モジュール構成

インフラストラクチャ層は技術スタック（TypeORM、Redis、S3）とドメインの組み合わせでモジュールを構成します。

```text
packages/infrastructure/movie/
├── typeorm/                        # データベース実装
│   ├── src/
│   │   ├── entities/               # ORMエンティティ（レコードモデル）
│   │   │   ├── MovieRecord.ts
│   │   │   └── index.ts
│   │   ├── repositories/           # リポジトリ実装
│   │   │   ├── MovieTypeOrmRepository.ts
│   │   │   └── index.ts
│   │   ├── migrations/             # データベースマイグレーション
│   │   │   ├── CreateMoviesMigration.ts
│   │   │   └── index.ts
│   │   ├── InfrastructureMovieTypeOrmModule.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── redis/                          # キャッシュ実装
│   ├── src/
│   │   ├── services/
│   │   │   ├── MovieCacheService.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── MovieRedisRepository.ts
│   │   │   └── index.ts
│   │   ├── InfrastructureMovieRedisModule.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── s3/                             # ファイルストレージ実装
    ├── src/
    │   ├── services/
    │   │   ├── MovieFileService.ts
    │   │   └── index.ts
    │   ├── InfrastructureMovieS3Module.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### インフラストラクチャモジュール登録

```typescript
// packages/infrastructure/movie/typeorm/src/InfrastructureMovieTypeOrmModule.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([MovieRecord]),
    // 共通インフラモジュール（エラーハンドラーなど）
    SharedInfrastructureModule,
  ],
  providers: [
    // リポジトリ実装を提供
    {
      provide: 'MovieRepository',
      useClass: MovieTypeOrmRepository,
    },
    // その他のインフラサービス
    MovieTypeOrmService,
  ],
  exports: [
    'MovieRepository',
    MovieTypeOrmService,
  ],
})
export class InfrastructureMovieTypeOrmModule {}
```

## 依存関係とモジュール構成

### レイヤー間依存関係

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│   ┌─────────────────┐          ┌─────────────────┐          │
│   │   REST API      │          │    GraphQL      │          │
│   │  (Controller)   │          │   (Resolver)    │          │
│   └─────────────────┘          └─────────────────┘          │
└─────────────────┬─────────────────────┬─────────────────────┘
                  │                     │
                  │   NestJS DI         │
                  │                     │
┌─────────────────▼─────────────────────▼─────────────────────┐
│                 Application Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  packages/core/{domain}/application/                    │ │
│  │  - UseCases    - Services    - DTOs                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────┬─────────────────────┬─────────────────────┘
                  │                     │
┌─────────────────▼─────────────────────▼─────────────────────┐
│                   Domain Layer                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  packages/core/{domain}/domain/                         │ │
│  │  - Entities    - Value Objects    - Domain Services    │ │
│  │  - Repository Interfaces                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  packages/core/shared/                                  │ │
│  │  - Base Classes    - Common Services    - Errors       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────▲─────────────────────┘
                                          │ implements
┌─────────────────────────────────────────┴─────────────────────┐
│                Infrastructure Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   TypeORM    │  │    Redis     │  │      S3      │       │
│  │(DB Access)   │  │  (Caching)   │  │(File Storage)│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  packages/infrastructure/{domain}/{tech-stack}/              │
└─────────────────────────────────────────────────────────────┘
```

### マイクロサービス間の依存関係

```text
Backend Services (NestJS)
├── actor-service/
│   ├── imports: [@cinecom/core-actor, @cinecom/infrastructure-actor-*]
│   └── provides: Actor REST API, Actor GraphQL API
├── movie-service/
│   ├── imports: [@cinecom/core-movie, @cinecom/infrastructure-movie-*]
│   └── provides: Movie REST API, Movie GraphQL API
├── review-service/
│   ├── imports: [@cinecom/core-review, @cinecom/core-movie, @cinecom/core-user]
│   ├── imports: [@cinecom/infrastructure-review-*]
│   └── provides: Review REST API, Review GraphQL API
├── scene-service/
│   ├── imports: [@cinecom/core-scene, @cinecom/core-movie, @cinecom/core-actor]
│   ├── imports: [@cinecom/infrastructure-scene-*]
│   └── provides: Scene REST API, Scene GraphQL API
└── user-service/
    ├── imports: [@cinecom/core-user, @cinecom/infrastructure-user-*]
    └── provides: User REST API, User GraphQL API
```

## パッケージ管理

### Monorepoツール

- **PNPM Workspaces**: 効率的な依存関係管理
- **Turbo**: ビルド・テストの並列実行と最適化

### パッケージネーミング

```text
@cinecom/core-movie
@cinecom/core-actor
@cinecom/core-shared
@cinecom/infrastructure-movie-typeorm
@cinecom/infrastructure-movie-redis
@cinecom/infrastructure-movie-s3
```

### package.jsonの構成例

```json
// packages/core/movie/package.json
{
  "name": "@cinecom/core-movie",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@cinecom/core-shared": "workspace:*",
    "@nestjs/common": "^10.0.0"
  }
}
```

## 開発・ビルドワークフロー

### 開発コマンド

```bash
# 特定のサービス開発
pnpm dev:movie-rest-api
pnpm dev:movie-graphql

# 共通パッケージ開発
pnpm dev:core-movie
pnpm dev:infrastructure-movie-typeorm

# 全体ビルド
pnpm build:all

# テスト実行
pnpm test:core
pnpm test:infrastructure
pnpm test:services
```

### CI/CDパイプライン統合

各パッケージとサービスに対して独立したCI/CDパイプラインを構成し、変更の影響範囲を最小化します。

---

## 関連ドキュメント

- **ドメイン設計**: `/docs/architecture/domain_design.md` - DDD設計原則とパターン
- **システム設計**: `/docs/architecture/system_design_template.md` - 全体アーキテクチャ
- **コーディング規約**: `/docs/development/coding_standards.md` - 命名規則・ファイル構成

---

**設計原則チェックリスト:**

- [ ] マイクロサービス間の疎結合が維持されている
- [ ] 共通パッケージの責務が明確に分離されている
- [ ] NestJSのDIシステムが適切に活用されている
- [ ] 技術スタックの変更が他レイヤーに影響しない
- [ ] パッケージの依存関係が循環していない
- [ ] 開発・ビルド・デプロイのワークフローが効率的である
