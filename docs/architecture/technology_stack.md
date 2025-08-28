# 技術スタック

## Cinecom プロジェクト - マイクロサービス構成

### 概要

本ドキュメントは、Cinecomプロジェクトで採用する技術スタックを定義します。映像作品・俳優データベースサービスに最適化されたマイクロサービス構成での技術選定とその理由を詳述します。

### フロントエンド技術スタック

#### **コアフレームワーク**

**Next.js 14+ with TypeScript**:

```yaml
選定理由:
  - Server-Side Rendering (SSR) によるSEO最適化
  - API Routes による簡単なサーバー機能
  - 豊富なエコシステムと活発なコミュニティ
  - TypeScriptネイティブサポート
  - マイクロサービスAPI統合の容易さ

バージョン: 14.x以上
主要機能:
  - App Router（最新のルーティングシステム）
  - Server Components（サーバーサイドレンダリング強化）
  - Image Optimization（画像最適化）
  - Code Splitting（自動コード分割）
```

#### **状態管理**

**Zustand / Redux Toolkit**:

```yaml
Zustand (推奨):
  用途: 軽量なローカル状態管理
  特徴: 
    - 最小限のボイラープレート
    - TypeScript完全サポート
    - マイクロサービス間のデータ管理に最適
  
Redux Toolkit (複雑な状態の場合):
  用途: 複雑なグローバル状態管理
  特徴:
    - 予測可能な状態管理
    - DevTools による豊富なデバッグ機能
    - ミドルウェアエコシステム
```

#### **UIフレームワーク・スタイリング**

**Tailwind CSS + HeadlessUI**:

```yaml
Tailwind CSS:
  選定理由:
    - ユーティリティファーストによる高速開発
    - 一貫したデザインシステム構築
    - 本番ビルド時の自動最適化（未使用CSS削除）
    - レスポンシブデザインの容易な実装

HeadlessUI:
  選定理由:
    - アクセシビリティ対応済みコンポーネント
    - Tailwind CSSとの完全統合
    - カスタマイズ性の高さ
    - React/Vue両対応（将来の技術選択肢拡張）

代替案:
  - Styled Components: CSS-in-JSが必要な場合
  - Material-UI: Google Material Designが要求される場合
```

#### **ビルド・開発ツール**

**Next.js内蔵ツール + 追加ツール**:

```yaml
Next.js内蔵:
  - Webpack（バンドル）
  - Babel（トランスパイル）
  - ESLint（コード品質）
  - SWC（高速コンパイル）

追加開発ツール:
  - Prettier: コードフォーマット統一
  - Husky: Git hooks管理
  - lint-staged: ステージングファイルのリント
  - TypeScript: 型安全性確保
```

#### **テストフレームワーク**

**Jest + React Testing Library**:

```yaml
Jest:
  用途: 単体テスト・統合テスト
  特徴:
    - ゼロ設定でのテスト実行
    - モック機能・スナップショットテスト
    - カバレッジレポート自動生成

React Testing Library:
  用途: Reactコンポーネントテスト
  特徴:
    - ユーザー行動に近いテストアプローチ
    - アクセシビリティを意識したテスト
    - Next.jsとの統合

E2Eテスト:
  - Playwright: マルチブラウザE2Eテスト
  - Cypress: 開発者フレンドリーなE2E（代替案）
```

### バックエンド技術スタック（マイクロサービス）

#### **ランタイム・言語**

**Node.js 18+ LTS**:

```yaml
選定理由:
  - JavaScript/TypeScript統一による開発効率向上
  - 豊富なライブラリエコシステム（npm/pnpm）
  - 非同期処理によるI/O集約的処理の高性能
  - マイクロサービス構築に適した軽量性

LTSバージョン採用理由:
  - 長期サポートによる安定性
  - セキュリティアップデートの確実性
  - 本番環境での信頼性
```

#### **フレームワーク**

**NestJS with TypeScript + Express.js**:

```yaml
NestJS:
  選定理由:
    - エンタープライズレベルのアーキテクチャ
    - デコレータによる宣言的プログラミング
    - 依存性注入（DI）によるテスタビリティ向上
    - マイクロサービス間通信のビルトイン対応
    - TypeScript完全サポート

Express.js:
  役割: NestJSの下層HTTP サーバー
  特徴:
    - 軽量で高性能
    - 豊富なミドルウェアエコシステム
    - NestJSとの完全統合

アーキテクチャパターン:
  - Module-based Architecture（モジュール分割）
  - Controller-Service-Repository Pattern
  - Dependency Injection（依存性注入）
```

#### **認証・セキュリティ**

**JWT + OAuth2 (Google/GitHub)**:

```yaml
JWT (JSON Web Token):
  用途: セッション管理・マイクロサービス間認証
  実装: @nestjs/jwt + passport-jwt
  特徴:
    - ステートレス認証
    - マイクロサービス間での認証情報共有
    - 拡張性の高いペイロード

OAuth2:
  プロバイダー: Google OAuth2、GitHub OAuth
  実装: Passport.js strategies
  用途:
    - ソーシャルログイン
    - ユーザー登録の簡素化
    - セキュアな認証フロー

追加セキュリティ:
  - bcrypt: パスワードハッシュ化
  - helmet: セキュリティヘッダー設定
  - rate-limiting: レート制限
  - CORS: クロスオリジン制御
```

#### **API設計**

**RESTful + GraphQL (段階的実装)**:

```yaml
段階的実装アプローチ:
  Phase 1 (Week 3-6): REST API基盤
    対象: サービス間通信・基本フロントエンド連携
    実装: NestJS @Controller + DTOs
    優先度: 高（MVP必須機能）

  Phase 2 (Week 7-9): GraphQL追加
    対象: フロントエンド最適化・複雑クエリ
    実装: @nestjs/graphql + Apollo Server
    優先度: 中（ユーザー体験向上）

使い分け方針:
  内部通信（サービス間）:
    - 技術: RESTful API
    - 理由: シンプル・統一性・デバッグしやすさ
    - 例: user-service ←→ movie-service

  外部API（フロントエンド連携）:
    - Phase 1: RESTful API（MVP実装）
    - Phase 2: GraphQL追加（最適化・柔軟性向上）
    - 理由: 必要データのみ取得・複雑クエリ対応

技術仕様:
  RESTful API:
    - HTTP標準メソッド（GET, POST, PUT, DELETE）
    - リソースベースURL設計
    - OpenAPI/Swagger自動ドキュメント生成
    - サービス間通信の標準プロトコル

  GraphQL (Phase 2):
    - 単一エンドポイント
    - 必要なデータのみ取得（Over-fetching解決）
    - 型安全なスキーマファースト開発
    - フロントエンド特化の柔軟なクエリ

API ドキュメント:
  - Swagger/OpenAPI: RESTful API
  - GraphQL Playground: GraphQL Schema (Phase 2)
```

#### **バリデーション**

**class-validator + zod**:

```yaml
class-validator:
  用途: RESTful API の DTOバリデーション
  特徴:
    - デコレータベースのバリデーション
    - NestJSとの完全統合
    - カスタムバリデーター作成

zod:
  用途: GraphQL・その他の型安全バリデーション
  特徴:
    - TypeScript-first バリデーション
    - ランタイム型チェック
    - スキーマから型定義自動生成
```

#### **サービス間通信**

**HTTP/REST + イベント駆動（Redis Pub/Sub）**:

```yaml
HTTP/REST:
  用途: 同期的なサービス間通信
  実装: @nestjs/axios + interceptors
  特徴:
    - 直接的なデータ要求・応答
    - エラーハンドリングの容易さ
    - デバッグ・監視の簡単さ

Redis Pub/Sub:
  用途: 非同期イベント駆動通信
  実装: @nestjs/microservices + Redis
  特徴:
    - イベントベースの疎結合
    - 非同期処理による性能向上
    - システム拡張性の向上

メッセージフォーマット:
  - JSON: 標準的なデータ交換
  - Protocol Buffers: 高性能が必要な場合
```

### データベース技術スタック

#### **メインデータベース**

**PostgreSQL 15+ (サービス別DB)**:

```yaml
選定理由:
  - ACID特性による高い信頼性
  - 豊富なデータ型（JSON、配列、地理空間データ）
  - 高度なクエリ機能（CTE、ウィンドウ関数）
  - マイクロサービス分散に適したスケーラビリティ

サービス別データベース設計:
  user-service: users、profiles、auth_tokens
  movie-service: movies、genres
  actor-service: actors、cast_relations、filmography
  scene-service: scenes、scene_categories、scene_tags
  review-service: reviews、ratings、watchlists

バージョン: 15.x以上
  - 性能向上（パーティション、インデックス最適化）
  - セキュリティ強化（接続・権限管理）
  - JSON操作の高速化
```

#### **キャッシュシステム**

**Redis 7+**:

```yaml
用途:
  - セッションキャッシュ（JWT blacklist等）
  - APIレスポンスキャッシュ
  - レート制限カウンター
  - Pub/Sub メッセージブローカー

実装:
  - @nestjs/redis + ioredis
  - Cache-aside pattern
  - TTL設定による自動期限切れ

キャッシュ戦略（段階的実装）:
  Phase 1: 基本実装
    - セッションキャッシュ（JWT blacklist等）
    - APIレスポンスキャッシュ
    - レート制限カウンター
  
  Phase 2: 多層化拡張
    - CDNキャッシュ連携
    - 複雑な検索結果キャッシュ
    - Write-Through/Write-Behind実装
  
  Phase 3: 高度化完成
    - 4層キャッシュシステム
    - Refresh-Ahead戦略
    - 自動キャッシュ無効化
```

#### **ORM・データアクセス**

**TypeORM**:

```yaml
選定理由:
  - TypeScript完全サポート
  - デコレータベースのエンティティ定義
  - マイグレーション管理機能
  - 複数データベースサポート

主要機能:
  - Entity Relationship Mapping
  - Query Builder + Raw SQL対応
  - Connection Pool管理
  - Transaction サポート

代替案:
  - Prisma: よりモダンなORM（TypeScript-first）
  - Sequelize: 豊富な機能・実績
```

#### **検索エンジン（オプション）**

**Elasticsearch**:

```yaml
用途:
  - 全文検索（映画タイトル、あらすじ）
  - 複雑な検索条件（ジャンル、俳優、シーン）
  - 検索候補・オートコンプリート
  - ログ・分析データ検索

実装時期: Phase 2以降（基本機能実装後）
代替案:
  - PostgreSQL Full-text Search: 軽量な検索機能
  - Amazon OpenSearch: マネージドElasticsearch
```

### インフラ・運用技術スタック

#### **コンテナ化**

**Docker + Docker Compose**:

```yaml
Docker:
  用途: サービス・環境の標準化
  構成:
    - マイクロサービス個別コンテナ
    - データベース・Redis コンテナ
    - 開発・テスト環境の統一

Docker Compose:
  用途: ローカル開発環境管理
  構成:
    - マルチサービス オーケストレーション
    - 環境変数・設定管理
    - ネットワーク・ボリューム管理

本番環境:
  - Container Orchestration: Kubernetes（将来拡張）
  - Serverless Container: Cloud Run等
```

#### **CI/CD**

**GitHub Actions**:

```yaml
選定理由:
  - GitHubとの完全統合
  - マイクロサービス別パイプライン構築
  - 豊富なAction エコシステム
  - 無料枠での十分な利用可能性

パイプライン構成:
  Build:
    - Node.js セットアップ
    - 依存関係インストール
    - TypeScript コンパイル
    - Docker イメージビルド
  
  Test:
    - Unit Test (Jest)
    - Integration Test
    - Security Scan
    - Code Quality Check
  
  Deploy:
    - ステージング環境（mainブランチ）
    - 本番環境（リリースタグ）
```

#### **監視・ログ**

**Sentry**:

```yaml
用途:
  - エラー監視・追跡
  - パフォーマンス監視
  - リリース追跡

実装:
  - Frontend: @sentry/nextjs
  - Backend: @sentry/node
  - Source Maps アップロード
  - アラート設定

追加監視:
  - Application Logs: Winston + structured logging
  - Metrics: Prometheus + Grafana（将来拡張）
  - Health Checks: 各サービス /health エンドポイント
```

#### **デプロイメント**

**Vercel (Frontend) + Render (Backend Services)**:

```yaml
Vercel:
  対象: Next.js フロントエンドアプリケーション
  特徴:
    - Next.js最適化済み
    - 自動スケーリング
    - CDN・Edge Functions
    - プレビューデプロイ

Render:
  対象: NestJS マイクロサービス群
  特徴:
    - マネージドコンテナプラットフォーム
    - 自動デプロイ・スケーリング
    - データベースサービス統合
    - 環境変数・シークレット管理

代替案:
  - AWS (ECS/Lambda): より高度な制御が必要な場合
  - Google Cloud Run: サーバーレスコンテナ
  - Railway: 簡素化されたデプロイ
```

### 外部サービス連携

#### **通知システム**

**Discord**:

```yaml
用途:
  - 開発進捗通知
  - エラー・アラート通知
  - レビュー依頼通知
  - システム監視アラート

実装:
  - Discord Webhook API
  - チャンネル別通知分散
  - 重要度別通知フォーマット
```

#### **分析・トラッキング**

**Google Analytics**:

```yaml
用途:
  - ユーザー行動分析
  - ページビュー・セッション追跡
  - コンバージョン分析

実装:
  - Next.js GA4統合
  - プライバシー対応（Cookie同意）
  - カスタムイベント追跡
```

### 開発・品質管理ツール

#### **コード品質**

**ESLint + Prettier + SonarQube**:

```yaml
ESLint:
  - 静的コード解析
  - TypeScript/React ルール
  - カスタムルール設定

Prettier:
  - コードフォーマット統一
  - エディタ統合
  - pre-commit hooks

SonarQube:
  - コード品質分析
  - セキュリティ脆弱性検出
  - 技術的負債追跡
```

#### **テストカバレッジ**

**Istanbul/nyc + Codecov**:

```yaml
カバレッジ計測:
  - Unit Test カバレッジ
  - Integration Test カバレッジ
  - E2E Test カバレッジ

レポート:
  - HTML レポート（ローカル）
  - Codecov（CI/CD統合）
  - PR コメント自動追加
```

### パフォーマンス最適化

#### **フロントエンド最適化**

```yaml
Next.js 最適化:
  - Image Optimization（next/image）
  - Code Splitting（動的インポート）
  - Static Site Generation（SSG）
  - Incremental Static Regeneration（ISR）

バンドル最適化:
  - Tree Shaking（未使用コード削除）
  - Minification（圧縮）
  - Webpack Bundle Analyzer
```

#### **バックエンド最適化**

```yaml
データベース最適化:
  - インデックス最適化
  - Connection Pooling
  - Query Optimization
  - Read Replica（将来拡張）

キャッシュ戦略:
  - Redis キャッシュ
  - HTTP キャッシュヘッダー
  - CDN キャッシュ（Vercel）
```

### セキュリティ考慮事項

#### **アプリケーションセキュリティ**

```yaml
OWASP Top 10対策:
  - SQL Injection: ORM使用・パラメータ化クエリ
  - XSS: CSP設定・入力エスケープ
  - CSRF: SameSite Cookie・CSRF トークン
  - セキュリティ設定不備: セキュリティヘッダー設定

認証・認可:
  - JWT + OAuth2
  - Role-based Access Control
  - Rate Limiting
  - Session Management
```

#### **インフラセキュリティ**

```yaml
ネットワークセキュリティ:
  - HTTPS強制（TLS 1.3）
  - セキュリティヘッダー（HSTS、CSP等）
  - CORS設定

シークレット管理:
  - 環境変数での機密情報管理
  - シークレット暗号化
  - 最小権限原則
```

### 技術選定の判断基準

#### **評価軸**

```yaml
技術評価基準:
  1. プロジェクト適合性: マイクロサービス・映像データベースに適しているか
  2. 開発効率: 開発チーム（AIエージェント）の生産性向上
  3. 保守性: 長期メンテナンスの容易さ
  4. パフォーマンス: 要求される性能要件の満足
  5. エコシステム: ドキュメント・コミュニティ・ライブラリ充実度
  6. 学習コスト: 新技術導入時の習得難易度
  7. スケーラビリティ: 将来の成長・拡張への対応
```

#### **技術変更プロセス**

```yaml
技術変更レベル:
  Level 1: ライブラリ・パッケージバージョン更新
    - 決定者: 担当エージェント
    - プロセス: 検証 → 適用 → 報告
  
  Level 2: 新ライブラリ・ツール追加
    - 決定者: 関連エージェント協議
    - プロセス: 評価 → 協議 → 承認 → 適用
  
  Level 3: 主要技術スタック変更
    - 決定者: 全体合意 + 人間承認
    - プロセス: 詳細評価 → 全体討議 → 人間承認 → 段階適用
```

### 関連ドキュメント

- **システム設計**: `/docs/architecture/system_design.md` - 全体システム構成
- **マイクロサービス設計**: `/docs/architecture/microservices_design.md` - サービス分割詳細
- **API仕様**: `/docs/architecture/api_specification.md` - REST/GraphQL API設計
- **データベース設計**: `/docs/architecture/database_schema.md` - DB構造詳細
- **開発環境セットアップ**: `/docs/development/setup_guide.md` - 環境構築手順

### 更新履歴

- **v1.0** (2025-08-22): 初版作成 - 基本技術スタック定義
- **次回更新予定**: Phase 1完了時（Week 2終了時）- 実装経験による調整

---

**注意**: 技術選定は実装経験と性能評価に基づいて継続的に最適化されます。新しい技術・ツールの評価も定期的に実施し、プロジェクトの成功に向けた最適な技術構成を維持します。
