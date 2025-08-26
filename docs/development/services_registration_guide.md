# 開発・運用サービス登録手順書（個人検証版）

## 概要

Cinecomプロジェクトの個人検証・開発に必要な外部サービスの登録手順を説明します。**無料プランを最大限活用**し、コストを抑えながら技術スタックとCI/CDパイプラインの動作確認ができる構成を提供します。

### 💡 個人検証向けの構成変更点

```yaml
アーキテクチャ簡略化:
  - マイクロサービス → 統合サービス（モジュール分離は保持）
  - 5つのDB → 1つの統合DB（スキーマ分離）
  - Redis → インメモリキャッシュ（node-cache）

利用プラン:
  - 全サービス無料プラン利用
  - 月額費用: $0（完全無料！）
  - 必要に応じて段階的アップグレード可能

制約事項:
  - 非アクティブ時の自動スリープ（15分）
  - ストレージ・帯域幅制限
  - 商用利用には有料プラン推奨
```

## 必要サービス一覧

### 1. インフラ・デプロイメント系サービス

#### **Vercel（フロントエンドデプロイ）**

**用途**: Next.js フロントエンドアプリケーションのデプロイ・ホスティング
**必要性**: 必須（個人検証・開発環境）
**技術的理由**: Next.js最適化、自動スケーリング、CDN・Edge Functions

```yaml
利用プラン:
  選択: Hobby プラン (無料)
  制限事項:
    - 1チームメンバーのみ
    - 100GB帯域幅/月
    - 1000 serverless function実行/日
    - カスタムドメインは1個まで

  個人検証には十分な機能:
    - Next.js 14+ サポート
    - GitHub Actions連携
    - プレビューデプロイ
    - 基本的な環境変数管理
```

#### **Render（バックエンドサービス）**

**用途**: NestJS マイクロサービス群のデプロイ・ホスティング
**必要性**: 必須（統合サービス1つ + 段階的分離）
**技術的理由**: マネージドコンテナ、PostgreSQL統合、自動スケーリング

```yaml
利用プラン:
  選択: Free プラン (無料)
  制限事項:
    - 750時間/月のランタイム
    - 非アクティブ時は自動スリープ（15分後）
    - 512MB RAM制限
    - カスタムドメインなし

  個人検証向け構成:
    段階1: 統合バックエンドサービス（1つ）
      - 全機能を1つのNestJSアプリに統合
      - マイクロサービス構造は保持（モジュール分離）

    段階2: 必要に応じて段階的分離
      - 重要なサービスのみ分離
      - 例：user-service（認証）を独立
```

#### **PostgreSQL Database（Render Managed）**

**用途**: アプリケーションデータベース
**必要性**: 必須（統合DB + スキーマ分離）
**技術的理由**: ACID特性、豊富なデータ型、高度なクエリ機能

```yaml
利用プラン:
  選択: Free プラン (無料)
  制限事項:
    - 1GB ストレージ制限
    - 非アクティブ時は自動スリープ
    - バックアップ機能なし
    - 接続数制限あり

  個人検証向けDB設計:
    統合データベース（1つ）:
      - 全テーブルを1つのDBに統合
      - スキーマまたはプレフィックスでサービス分離
      - 例：user_*, movie_*, actor_*, scene_*, review_*

    将来拡張時:
      - 必要に応じてサービス別DB分離
      - データ移行スクリプト準備
```

#### **Redis（代替案：インメモリキャッシュ）**

**用途**: セッションキャッシュ、APIレスポンスキャッシュ
**必要性**: オプション（個人検証では省略可能）
**技術的理由**: 高速キャッシュ、セッション管理

```yaml
無料プラン対応:
  選択肢1: Redis省略（推奨）
    - インメモリキャッシュ使用（node-cache）
    - JWT blacklist機能は簡略化
    - セッション情報はJWT内に格納

  選択肢2: Upstash Redis（無料プラン）
    - 10,000 requests/月
    - 256MB データ容量
    - 基本的なキャッシュ機能のみ

個人検証向け実装:
  - node-cache でローカルキャッシュ
  - 簡単なレート制限実装
  - 本番環境でのみRedis利用検討
```

### 2. 認証・セキュリティ系サービス

#### **Google Cloud Console（OAuth2プロバイダー）**

**用途**: Google OAuth2 ソーシャルログイン
**必要性**: 必須（ユーザー認証）
**技術的理由**: セキュアな認証フロー、ユーザー登録簡素化

```yaml
利用コスト: 無料
サービス: Google OAuth 2.0

設定要件:
  - OAuth 2.0 Client ID作成
  - 認証済みドメイン設定
  - スコープ設定（profile, email）
```

#### **GitHub（OAuth App）**

**用途**: GitHub OAuth ソーシャルログイン
**必要性**: 必須（開発者向け認証）
**技術的理由**: 開発者フレンドリーな認証、GitHub統合

```yaml
利用コスト: 無料
サービス: GitHub OAuth Apps

設定要件:
  - OAuth App作成
  - Authorization callback URL設定
  - Client ID・Secret取得
```

### 3. CI/CD・DevOps系サービス

#### **GitHub Actions**

**用途**: CI/CDパイプライン、自動テスト・デプロイ
**必要性**: 必須（継続的インテグレーション）
**技術的理由**: GitHub統合、統合サービスパイプライン

```yaml
利用プラン: GitHub Free（無料）
制限事項:
  - 2,000分/月のアクション時間
  - パブリックリポジトリは無制限
  - プライベートリポジトリも十分な時間

個人検証向け構成:
  - 統合サービス用の単一パイプライン
  - 基本的なテスト・デプロイ自動化
  - セキュリティスキャン（無料範囲）
  - 必要に応じてGitHub Pro検討（$4/月）
```

### 4. 監視・分析系サービス

#### **Sentry**

**用途**: エラー監視・追跡、パフォーマンス監視
**必要性**: 推奨（品質管理）
**技術的理由**: リアルタイムエラー検出、パフォーマンス分析

```yaml
利用プラン: Developer プラン（無料）
制限事項:
  - 5,000 errors/月
  - 10,000 performance transactions/月
  - 1人のチームメンバー
  - 30日間データ保持

個人検証には十分:
  - Frontend: @sentry/nextjs
  - Backend: @sentry/node（統合サービス）
  - 基本的なエラー追跡
  - パフォーマンス監視（制限あり）
```

#### **Codecov**

**用途**: テストカバレッジ分析・レポート
**必要性**: オプション（コード品質管理）
**技術的理由**: PR統合、カバレッジトレンド分析

```yaml
利用プラン: Free プラン（無料）
制限事項:
  - パブリックリポジトリのみ対応
  - 基本的なカバレッジレポート機能

代替案（プライベートリポジトリ用）:
  - GitHub Actions内蔵カバレッジ機能
  - Jest Coverage Reports
  - コメント機能は制限されるが十分実用的
```

#### **SonarQube（コード品質分析）**

**用途**: 静的コード解析、コード品質管理、セキュリティ脆弱性検出
**必要性**: 推奨（コード品質・セキュリティ管理）
**技術的理由**: 技術的負債追跡、バグ検出、セキュリティホール検出

```yaml
利用プラン: SonarCloud Free プラン（無料）
制限事項:
  - パブリックリポジトリのみ対応
  - プライベートは有料（$10/月〜）

無料プラン機能:
  - 静的コード解析（JavaScript/TypeScript）
  - セキュリティホットスポット検出
  - コード重複検出
  - 技術的負債計測
  - GitHub PR統合
  - 品質ゲート機能

個人検証向け設定:
  - パブリックリポジトリでの利用
  - GitHub Actions統合
  - PR品質チェック自動化
  - 継続的コード品質監視
```

#### **Google Analytics**

**用途**: ユーザー行動分析・アクセス解析
**必要性**: 推奨（ビジネス分析）
**技術的理由**: ユーザー体験向上、機能利用分析

```yaml
利用コスト: 無料（Google Analytics 4）
サービス: GA4

分析項目:
  - ページビュー・セッション
  - ユーザー行動フロー
  - 検索・シーン利用パターン
  - コンバージョン分析
```

### 5. 開発・コラボレーション系サービス

#### **Discord（チーム通知）**

**用途**: CI/CD通知、アラート、チーム協調
**必要性**: 推奨（チーム効率化）
**技術的理由**: リアルタイム通知、GitHub Actions統合

```yaml
利用コスト: 無料
サービス: Discord Server

通知設定:
  - ビルド・デプロイ結果通知
  - セキュリティアラート
  - エラー監視アラート
  - プロジェクト進捗通知
```

## 登録手順詳細

### 1. Vercel登録・設定

#### ステップ1: アカウント作成

1. [Vercel](https://vercel.com) にアクセス
2. **"Start Deploying"** をクリック
3. GitHubアカウントで連携ログイン
4. プランを選択（**Pro プラン推奨**）

#### ステップ2: プロジェクト作成

```bash
# Vercel CLIインストール
npm install -g vercel

# プロジェクト初期化
cd frontend/
vercel

# プロジェクト設定
vercel --prod  # 本番デプロイ確認
```

#### ステップ3: 環境変数設定

Vercel Dashboardで以下の環境変数を設定:

```yaml
本番環境:
  NEXT_PUBLIC_API_BASE_URL: "https://api.cinecom.com"
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: "Google OAuth Client ID"
  NEXT_PUBLIC_GITHUB_CLIENT_ID: "GitHub OAuth Client ID"
  NEXT_PUBLIC_SENTRY_DSN: "Sentry DSN"
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "Google Analytics ID"

ステージング環境:
  NEXT_PUBLIC_API_BASE_URL: "https://staging-api.cinecom.com"
  # 本番と同じ設定値（テスト用）
```

#### ステップ4: GitHub Actions統合設定

GitHub Secretsに以下を追加:

```yaml
VERCEL_TOKEN: "Vercelアクセストークン（Account Settings → Tokens）"
VERCEL_ORG_ID: "Team Settings → General → Team ID"
VERCEL_PROJECT_ID: "Project Settings → General → Project ID"
```

### 2. Render登録・設定

#### ステップ1: アカウント作成

1. [Render](https://render.com) にアクセス
2. **"Get Started"** をクリック
3. GitHubアカウントで連携ログイン
4. Individual または Team アカウント作成

#### ステップ2: マイクロサービス作成

各サービスに対して以下を実行:

```yaml
サービス作成手順（各サービス共通）:
  1. "New +" → "Web Service" を選択
  2. GitHubリポジトリを接続
  3. サービス設定:
     Name: "cinecom-[service-name]"
     Environment: "Node"
     Build Command: "pnpm install --frozen-lockfile && pnpm run build"
     Start Command: "pnpm run start:prod"
     Plan: "Starter ($7/月)"
  4. 環境変数設定（後述）
  5. デプロイ実行
```

#### ステップ3: PostgreSQLデータベース作成

各サービス用データベースを作成:

```yaml
データベース作成手順:
  1. "New +" → "PostgreSQL" を選択
  2. 設定:
     Name: "cinecom-[service-name]-db"
     Plan: "Starter ($7/月)"
     PostgreSQL Version: "15"
  3. 作成後、Connection Stringを記録
```

#### ステップ4: Redis作成

```yaml
Redis作成手順:
  1. "New +" → "Redis" を選択
  2. 設定:
     Name: "cinecom-redis"
     Plan: "Starter ($7/月)"
  3. 作成後、Redis URLを記録
```

#### ステップ5: 環境変数設定

各マイクロサービスに以下の環境変数を設定:

```yaml
共通環境変数:
  NODE_ENV: "production"
  PORT: "10000"
  JWT_SECRET: "ランダム生成された強力な秘密鍵"
  JWT_EXPIRES_IN: "24h"
  REDIS_URL: "Render Redis URL"

サービス別環境変数:
  user-service:
    DATABASE_URL: "User DB Connection String"
    GOOGLE_CLIENT_ID: "Google OAuth Client ID"
    GOOGLE_CLIENT_SECRET: "Google OAuth Client Secret"
    GITHUB_CLIENT_ID: "GitHub OAuth Client ID"
    GITHUB_CLIENT_SECRET: "GitHub OAuth Client Secret"

  movie-service:
    DATABASE_URL: "Movie DB Connection String"

  actor-service:
    DATABASE_URL: "Actor DB Connection String"

  scene-service:
    DATABASE_URL: "Scene DB Connection String"

  review-service:
    DATABASE_URL: "Review DB Connection String"
    USER_SERVICE_URL: "https://cinecom-user-service.render.com"
    MOVIE_SERVICE_URL: "https://cinecom-movie-service.render.com"
```

### 3. Google OAuth2設定

#### ステップ1: Google Cloud Console設定

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成: "Cinecom Authentication"
3. **APIs & Services** → **OAuth consent screen** を設定:

```yaml
OAuth consent screen設定:
  Application name: "Cinecom"
  User support email: "プロジェクトメールアドレス"
  Application homepage: "https://cinecom.com"
  Authorized domains:
    - "cinecom.com"
    - "vercel.app"
  Scopes: "email, profile, openid"
```

#### ステップ2: OAuth 2.0 Client ID作成

**APIs & Services** → **Credentials** → **Create Credentials**:

```yaml
OAuth 2.0 Client ID設定:
  Application type: "Web application"
  Name: "Cinecom Web Client"
  Authorized JavaScript origins:
    - "https://cinecom.com"
    - "https://cinecom.vercel.app"
    - "https://staging.cinecom.com"
  Authorized redirect URIs:
    - "https://cinecom.com/api/auth/google/callback"
    - "https://staging.cinecom.com/api/auth/google/callback"
    - "http://localhost:3000/api/auth/google/callback"
```

#### ステップ3: 認証情報の記録

```yaml
取得する情報:
  GOOGLE_CLIENT_ID: "OAuth 2.0 Client ID"
  GOOGLE_CLIENT_SECRET: "OAuth 2.0 Client Secret"
```

### 4. GitHub OAuth App設定

#### ステップ1: OAuth App作成

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. **New OAuth App** をクリック:

```yaml
OAuth App設定:
  Application name: "Cinecom"
  Homepage URL: "https://cinecom.com"
  Authorization callback URL: "https://cinecom.com/api/auth/github/callback"
  Application description: "映画・俳優データベースサービス"
```

#### ステップ2: 追加の認証済みURL設定

```yaml
追加認証URL（本番設定後に更新）:
  - "https://staging.cinecom.com/api/auth/github/callback"
  - "http://localhost:3000/api/auth/github/callback"
```

#### ステップ3: 認証情報の記録

```yaml
取得する情報:
  GITHUB_CLIENT_ID: "OAuth App Client ID"
  GITHUB_CLIENT_SECRET: "OAuth App Client Secret"
```

### 5. Sentry設定

#### ステップ1: アカウント作成

1. [Sentry](https://sentry.io) にアクセス
2. **"Get started"** をクリック
3. アカウント作成（GitHubログイン可能）
4. プランを選択（**Developer プラン推奨**）

#### ステップ2: プロジェクト作成

```yaml
プロジェクト作成（フロントエンド用）:
  Platform: "Next.js"
  Project name: "cinecom-frontend"
  Team: 適切なチームを選択

プロジェクト作成（バックエンド用）:
  Platform: "Node.js"
  Project name: "cinecom-backend"
  Team: 適切なチームを選択
```

#### ステップ3: DSN取得

各プロジェクトから DSN（Data Source Name）を取得:

```yaml
取得する情報:
  SENTRY_DSN_FRONTEND: "フロントエンド用 DSN"
  SENTRY_DSN_BACKEND: "バックエンド用 DSN"
```

### 6. その他のサービス設定

#### Codecov設定

1. [Codecov](https://codecov.io) にアクセス
2. GitHubアカウントでログイン
3. パブリックリポジトリを有効化（無料プラン）
4. アップロードトークンを取得

#### SonarCloud設定

1. [SonarCloud](https://sonarcloud.io) にアクセス
2. **"Sign up"** → GitHubアカウントでログイン
3. **"Analyze your code for free"** を選択

##### プロジェクト作成

```yaml
プロジェクト設定:
  1. "+" → "Analyze new project" をクリック
  2. GitHubリポジトリを選択
  3. プロジェクト設定:
     Organization: 自動作成またはGitHubユーザー名
     Project key: "cinecom"
     Display name: "Cinecom"

  4. 分析方法選択:
     "With GitHub Actions" を選択（推奨）
```

##### GitHub Actions統合

```yaml
自動セットアップ:
  1. SonarCloudが自動でGitHub Secretsを設定
  2. 以下のSecretが追加される:
     SONAR_TOKEN: SonarCloud認証トークン

  3. ワークフローファイル例:
     .github/workflows/sonar.yml が自動作成
```

##### 品質ゲート設定

```yaml
品質ゲート設定:
  1. Project Settings → Quality Gates
  2. デフォルト品質ゲートを使用（推奨）
  3. カスタムルール（オプション）:
     - Coverage: 80%以上
     - Security Rating: A
     - Reliability Rating: A
     - Maintainability Rating: A
```

#### Google Analytics設定

1. [Google Analytics](https://analytics.google.com) にアクセス
2. アカウント作成・プロパティ設定:

```yaml
GA4プロパティ設定:
  Property name: "Cinecom"
  Country: "Japan"
  Currency: "Japanese Yen"
  Industry: "Technology"
```

3. 測定IDを取得: `G-XXXXXXXXXX`

#### Discord設定（オプション）

1. Discordサーバーを作成
2. **Server Settings** → **Integrations** → **Webhooks**
3. 通知チャンネル用のWebhook URLを作成

## 設定値の管理

### GitHub Secrets設定

すべての認証情報をGitHub Secretsに設定:

```yaml
# 基本認証情報
GOOGLE_CLIENT_ID: "Google OAuth Client ID"
GOOGLE_CLIENT_SECRET: "Google OAuth Client Secret"
GITHUB_CLIENT_ID: "GitHub OAuth Client ID"
GITHUB_CLIENT_SECRET: "GitHub OAuth Client Secret"

# デプロイ設定
VERCEL_TOKEN: "Vercelアクセストークン"
VERCEL_ORG_ID: "Vercel組織ID"
VERCEL_PROJECT_ID: "VercelプロジェクトID"
RENDER_API_KEY: "Render APIキー"

# Renderサービス別設定
RENDER_USER_SERVICE_ID: "user-service ID"
RENDER_MOVIE_SERVICE_ID: "movie-service ID"
RENDER_ACTOR_SERVICE_ID: "actor-service ID"
RENDER_SCENE_SERVICE_ID: "scene-service ID"
RENDER_REVIEW_SERVICE_ID: "review-service ID"

# データベース接続文字列
DATABASE_URL_USER: "User DB接続文字列"
DATABASE_URL_MOVIE: "Movie DB接続文字列"
DATABASE_URL_ACTOR: "Actor DB接続文字列"
DATABASE_URL_SCENE: "Scene DB接続文字列"
DATABASE_URL_REVIEW: "Review DB接続文字列"
REDIS_URL: "Redis接続文字列"

# 監視・分析
SENTRY_DSN_FRONTEND: "フロントエンド用Sentry DSN"
SENTRY_DSN_BACKEND: "バックエンド用Sentry DSN"
CODECOV_TOKEN: "Codecovアップロードトークン"
SONAR_TOKEN: "SonarCloud認証トークン"
NEXT_PUBLIC_GA_MEASUREMENT_ID: "Google Analytics測定ID"

# 通知設定（オプション）
DISCORD_WEBHOOK_URL: "Discord Webhook URL"
```

### 環境変数ドキュメント作成

`.env.example` ファイルを各サービスディレクトリに作成:

```bash
# frontend/.env.example
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id

# services/user-service/.env.example
NODE_ENV=development
PORT=4001
DATABASE_URL=postgresql://user:password@localhost:5432/users
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SENTRY_DSN=your_sentry_dsn
```

## 費用見積もり

### 月額費用概算（個人検証版）

```yaml
完全無料構成:
  Vercel Hobby: $0/月
  Render Free Web Service: $0/月
  Render Free PostgreSQL: $0/月
  Sentry Developer Free: $0/月
  SonarCloud Free: $0/月
  GitHub Actions Free: $0/月
  Google OAuth2: $0/月
  GitHub OAuth: $0/月
  Google Analytics: $0/月
  Discord通知: $0/月

  合計月額: $0/月（完全無料！）

オプション追加費用:
  GitHub Pro: $4/月（追加CI/CD時間・高度な機能が必要な場合）
  Upstash Redis: $0/月（無料枠内）

  最大月額: $4/月（約600円/月）

制限事項（無料プランの場合）:
  - Render: 非アクティブ時の自動スリープ
  - PostgreSQL: 1GBストレージ制限
  - Vercel: 100GB帯域幅/月制限
  - Sentry: 5,000 errors/月制限
  - GitHub Actions: 2,000分/月制限
```

### 初期セットアップ時間（個人検証版）

```yaml
作業時間見積もり:
  アカウント作成・基本設定: 2時間
  OAuth設定・テスト: 1.5時間
  Render環境構築（統合サービス）: 2時間
  Vercel設定・デプロイテスト: 1時間
  Sentry設定: 1時間
  GitHub Secrets設定: 0.5時間
  動作確認・テスト: 1時間

  合計: 9時間（1.5営業日程度）

削減要因:
  - サービス数が少ない（統合構成）
  - 無料プランの簡単設定
  - 複雑な環境分離が不要
```

## 確認・テスト手順

### セットアップ完了チェックリスト（個人検証版）

```yaml
基本機能確認:
  - [ ] フロントエンドがVercel（無料プラン）でデプロイされている
  - [ ] 統合バックエンドサービスがRender（無料プラン）で稼働している
  - [ ] PostgreSQLデータベース（無料プラン）に接続できる
  - [ ] Google OAuth認証が動作する
  - [ ] GitHub OAuth認証が動作する
  - [ ] 基本的なAPIエンドポイントが応答する

CI/CD確認:
  - [ ] GitHub Actions（無料プラン）でビルドが動作する
  - [ ] mainブランチでRender自動デプロイが実行される
  - [ ] Vercelで自動デプロイが実行される
  - [ ] 基本的なテストが通る

監視・分析確認（オプション）:
  - [ ] Sentryでエラー追跡が動作している（5,000 errors/月制限内）
  - [ ] SonarCloudでコード品質分析が実行されている
  - [ ] GitHub PRでSonarCloud品質チェックが動作する
  - [ ] Google Analyticsでアクセス解析ができる
  - [ ] Discord通知（オプション）が動作している

無料プラン制限の確認:
  - [ ] Renderサービスが15分後にスリープすることを確認
  - [ ] 初回アクセス時のコールドスタート時間を確認
  - [ ] データベースストレージ容量（1GB制限）を確認
```

### トラブルシューティング

```yaml
よくある問題と解決方法:
  認証エラー:
    - OAuth設定のリダイレクトURL確認
    - 環境変数の設定値確認
    - CORS設定の確認

  デプロイエラー:
    - ビルドコマンドの確認
    - 環境変数の設定確認
    - ログの詳細確認

  データベース接続エラー:
    - 接続文字列の形式確認
    - ネットワーク設定の確認
    - データベースの稼働状態確認
```

## まとめ

この手順書に従って設定を完了すると、Cinecomプロジェクトの個人検証・開発に必要な全てのサービスが**完全無料**で利用可能になります。

### 個人検証版の特徴

```yaml
コスト面:
  - 完全無料で本格的な開発環境を構築可能
  - 最大でも月額$4（GitHub Pro）程度
  - 従来比較：約$137→$0の大幅コスト削減

機能面:
  - マイクロサービス構成の学習・検証が可能
  - CI/CD パイプラインの動作確認
  - 認証・監視システムの実装体験
  - コード品質分析・セキュリティスキャンの実践
  - 本番環境への段階的移行準備

制限事項:
  - 非アクティブ時の自動スリープ
  - ストレージ・帯域幅制限
  - 一部高度な機能の制限
  - 商用利用には制約あり
```

### スケールアップパス

個人検証から商用環境への移行時は段階的にプランをアップグレード：

```yaml
段階1: 完全無料版（個人検証・学習）
段階2: 部分有料版（$20-50/月、小規模運用）
段階3: 本格運用版（$100-200/月、商用サービス）
```

**次のステップ**:

1. サービス設定完了後は、`/docs/development/github_setup_instructions.md` に従ってGitHub環境を設定
2. 統合バックエンドサービスの実装から開始
3. 動作確認後、必要に応じてマイクロサービス分離を検討
