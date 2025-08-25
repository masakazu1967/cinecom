# GitHub設定手順書（単一アカウント・AI協調開発用）

## 概要

CinecomプロジェクトのAIエージェント協調開発に必要なGitHub設定の手順を説明します。**全てのAIエージェントは単一のGitHubアカウントで動作**することを前提とした実用的な設定を提供します。

## 🤖 AIエージェント協調開発の特徴

```yaml
開発体制の特徴:
  - 全エージェントが同一GitHubアカウントで動作
  - 権限分離は技術的に不可能
  - 代替手法でエージェント識別・管理

管理手法:
  - ブランチ命名規則でエージェント識別
  - コミットメッセージでの担当エージェント明記
  - ドキュメントベースでの役割分担
  - 自動化ルールでの品質管理
```

## 1. ブランチ保護ルール設定

### mainブランチ保護（単一アカウント・AI協調開発用）

GitHubリポジトリの設定画面で以下を設定:

1. **Settings** → **Branches** → **Add rule** をクリック
2. **Branch name pattern**: `main`
3. 以下のオプションを有効化:

```yaml
実用的な保護設定:
  ✅ Require a pull request before merging
    # 承認関連は全て無効（単一アカウントでは不可能）
    ❌ Require approvals: 0  # 自己承認不可のため無効
    ❌ Dismiss stale PR approvals when new commits are pushed
    ❌ Require review from code owners
    ❌ Require conversation resolution before merging
  
  ✅ Require status checks to pass  # 自動品質管理の要
    ✅ Require branches to be up to date before merging
    必須ステータスチェック:
      - frontend-ci
      - backend-ci
      - security-scan
      - sonarcloud
  
  ❌ Require signed commits  # 個人開発では不要
  ✅ Require linear history  # クリーンな履歴維持

代替品質管理:
  - CI/CDパイプラインでの厳格なチェック
  - PRテンプレートでの自己チェックリスト
  - SonarCloud品質ゲートによる自動ブロック
  - Dependabotによる脆弱性監視
```

### AIエージェント用ブランチ命名規則

単一アカウントでエージェントを識別するためのブランチ命名規則:

```yaml
エージェント別ブランチ命名:
  feature/agent-{role}-{description}
  
例:
  - feature/agent-frontend-movie-search-ui
  - feature/agent-backend-user-authentication
  - feature/agent-database-schema-optimization
  - feature/agent-test-integration-tests
  - feature/agent-security-oauth-implementation
  - hotfix/agent-devops-ci-pipeline-fix

利点:
  - ブランチ名でエージェント識別可能
  - GitHub Actionsでエージェント別処理可能
  - 履歴追跡とデバッグが容易
```

### feature/*ブランチでのCI実行（推奨）

featureブランチでも基本的なCIを実行して品質を維持:

```yaml
CI実行設定:
  対象: feature/* ブランチの push 時
  実行内容:
    - Lint チェック
    - Type チェック
    - Unit テスト
    - セキュリティスキャン（軽量）
  
  利点:
    - 早期バグ発見
    - mainブランチの品質維持
    - マージ前の問題修正
```

**注意**: GitHub Flowではmainブランチがプロダクションブランチとなるため、developブランチは使用しません。

## 2. GitHub Projects設定（カンバンボード）

### プロジェクト作成

1. **Projects** タブ → **New project** をクリック
2. **Project name**: "Cinecom Development Board"
3. **Template**: "Team planning" を選択 (または "Blank project" から開始)
4. **Create project** をクリック

### ボードのカスタマイズ

#### カラム設定

以下のカラムを作成:

```yaml
カラム構成:
  - name: "📋 Backlog"
    description: "優先度付けされていないタスク"
    automation: "新しいIssue作成時に自動追加"

  - name: "🎯 Ready"
    description: "着手準備が完了したタスク"
    automation: "手動移動"

  - name: "🏗️ In Progress"
    description: "作業中のタスク"
    automation: "PRリンク時に自動移動"

  - name: "👀 In Review"
    description: "レビュー中のタスク"
    automation: "PR作成時に自動移動"

  - name: "🧪 Testing"
    description: "テスト中のタスク"
    automation: "手動移動"

  - name: "✅ Done"
    description: "完了したタスク"
    automation: "PRマージ時に自動移動"
```

#### フィールド設定

カスタムフィールドを追加:

```yaml
カスタムフィールド:
  Priority:
    type: "Single select"
    options: ["🔴 Critical", "🟠 High", "🟡 Medium", "🟢 Low"]

  Component:
    type: "Single select"
    options: ["Frontend", "Backend", "Database", "DevOps", "Documentation"]

  Agent:
    type: "Single select"
    options: ["Requirements", "Architecture", "Backend", "Frontend", "Database", "Test", "Security", "DevOps", "PM"]

  Story Points:
    type: "Number"
    description: "見積もりポイント"

  Sprint:
    type: "Single select"
    options: ["Sprint 1", "Sprint 2", "Sprint 3", "Backlog"]
```

#### ビューの設定

複数のビューを作成:

```yaml
ビュー設定:
  Board View:
    type: "Board"
    group_by: "Status"
    sort_by: "Priority"

  Sprint Planning:
    type: "Table"
    filter: "Sprint = 'Current Sprint'"
    fields: ["Title", "Priority", "Component", "Story Points", "Assignee"]

  Agent Workload:
    type: "Table"
    group_by: "Agent"
    fields: ["Title", "Status", "Priority", "Story Points"]

  Roadmap:
    type: "Roadmap"
    date_field: "Target Date"
    group_by: "Component"
```

### 自動化ルールの設定

#### Default Workflows設定

プロジェクト内で **Workflows** メニューから以下のDefault workflowsを設定:

```yaml
利用可能な自動化:
  Item added to project:
    - Status を "📋 Backlog" に設定

  Item closed:
    - Status を "✅ Done" に設定

  Pull request merged:
    - Status を "✅ Done" に設定
```

#### 手動管理が必要な操作

以下の操作はGitHub ProjectsのDefault workflowsでは自動化できません:

```yaml
手動操作が必要:
  - Priority設定 (新しいアイテム追加時)
  - PR作成時のStatus変更 (Ready → In Progress)
  - PR作成時のStatus変更 (In Progress → In Review)
  - レビュー完了後の手動移動
```

**注意**: これらの操作は各エージェントがghコマンドまたはWeb UIで手動実行する必要があります。
エージェント向けの詳細な操作方法は各エージェントドキュメントに記載します。

## 3. AIエージェント協調管理

### 権限管理の現実

単一GitHubアカウントでのAIエージェント開発では、従来の権限管理は適用できません:

```yaml
技術的制約:
  - 全エージェントが同一GitHubアカウントで実行
  - Teams機能は使用不可（個人アカウント）
  - Collaborator招待も意味なし
  - CODEOWNERS による自動レビューも同一ユーザーのため無効

代替管理手法:
  1. ドキュメントベースでの役割分担
  2. ブランチ命名規則でのエージェント識別
  3. コミットメッセージでの担当者明記
  4. プルリクエストテンプレートでの自己チェック
```

### エージェント協調のベストプラクティス

```yaml
推奨運用方法:
  ブランチ管理:
    - feature/agent-{role}-{task} 命名規則
    - エージェント別作業分離
    - 明確なマージタイミング

  コミット管理:
    - "feat(frontend): add movie search UI by frontend-agent"
    - "fix(backend): resolve auth bug by backend-agent"
    - エージェント識別可能なメッセージ

  品質管理:
    - CI/CDによる自動チェック
    - PRテンプレートでの自己レビューリスト
    - SonarCloudによる品質強制

  進捗管理:
    - GitHub Projects でタスク可視化
    - Issue によるエージェント間調整
    - Milestone でフェーズ管理
```

## 4. 環境変数とシークレット設定

### Repository Secrets

**Settings** → **Secrets and variables** → **Actions** で以下を設定:

```yaml
Required Secrets:
  # Vercel設定
  VERCEL_TOKEN: "Vercelアクセストークン"
  VERCEL_ORG_ID: "組織ID"
  VERCEL_PROJECT_ID: "プロジェクトID"

  # Render設定
  RENDER_API_KEY: "Render APIキー"
  RENDER_SERVICE_ID_STAGING: "ステージング環境サービスID"
  RENDER_SERVICE_ID_PRODUCTION: "本番環境サービスID"

  # 環境URL
  STAGING_FRONTEND_URL: "https://cinecom-staging.vercel.app"
  STAGING_BACKEND_URL: "https://cinecom-api-staging.render.com"
  PRODUCTION_FRONTEND_URL: "https://cinecom.vercel.app"
  PRODUCTION_BACKEND_URL: "https://cinecom-api.render.com"

  # 分析ツール
  SONAR_TOKEN: "SonarCloudトークン"
  CODECOV_TOKEN: "Codecovトークン"

  # 通知設定（オプション）
  SLACK_WEBHOOK: "Slack Webhook URL"
  DISCORD_WEBHOOK: "Discord Webhook URL"
```

## 5. Webhook設定

### Discord通知設定（オプション）

1. **Settings** → **Webhooks** → **Add webhook**
2. 以下の設定:

```yaml
Webhook設定:
  Payload URL: "Discord Webhook URL"
  Content type: "application/json"
  Events:
    - Issues
    - Pull requests
    - Push
    - Releases
    - Workflow runs
```

## 6. セキュリティ設定

### Security設定の有効化

**Settings** → **Advanced Security** で以下のセキュリティ機能を設定します:

```yaml
推奨設定（パブリックリポジトリ）:
  ✅ Private vulnerability reporting
    説明: セキュリティ脆弱性の非公開報告を有効化
    設定: Enable
    
  ✅ Dependency graph
    説明: 依存関係の可視化（通常デフォルトで有効）
    設定: 既に有効の場合はそのまま
    
  ✅ Dependabot alerts
    説明: 脆弱性のある依存関係の自動検出・通知
    設定: Enable
    
  ✅ Dependabot security updates
    説明: セキュリティ脆弱性の自動修正PR作成
    設定: Enable
    
  ✅ Grouped security updates
    説明: 複数の脆弱性修正を1つのPRにグループ化
    設定: Enable（効率的なセキュリティ更新のため）
    
  ✅ Dependabot version updates
    説明: 依存関係の定期的な更新PR作成
    設定: Enable（.github/dependabot.yml設定ファイル必要）
    
  ✅ Code scanning
    Tools → CodeQL analysis:
      設定方法: "Set up" → "Default" を選択
      説明: GitHub推奨設定でJavaScript/TypeScript等を自動スキャン
      実行タイミング: PRとmainブランチへのpush時
      注意: GitHub Actions実行時間を消費（月2000分制限）
    
  ⚠️ Secret scanning
    状態: パブリックリポジトリでは自動有効
    説明: コミットされた認証情報・APIキーを自動検出
    注意: 無効化は非推奨（セキュリティリスクのため）
    
  ⚠️ Secret scanning push protection
    状態: Secret scanningと連動して自動有効
    説明: 認証情報のpush時にブロック
    注意: 無効化は非推奨（セキュリティリスクのため）
```

### Dependabot設定

`.github/dependabot.yml` ファイルを作成:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "monthly"
    open-pull-requests-limit: 3

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    open-pull-requests-limit: 3
```

## 7. 検証手順

### 設定確認チェックリスト

```yaml
検証項目:
  ブランチ保護:
    - [ ] mainブランチに直接pushできない
    - [ ] PRなしでマージできない
    - [ ] 必須レビュアーの承認が必要
    - [ ] CIチェックが必須

  Projects:
    - [ ] カンバンボードが表示される
    - [ ] Issue作成時に自動でBacklogに追加
    - [ ] PR作成時にIn Reviewに移動
    - [ ] PRマージ時にDoneに移動

  CI/CD:
    - [ ] PRでCIが実行される
    - [ ] mainブランチでCDが実行される
    - [ ] テストが失敗するとマージブロック

  セキュリティ:
    - [ ] シークレットスキャンが動作
    - [ ] Dependabotアラートが表示
    - [ ] CodeQLスキャンが実行
```

## トラブルシューティング

### よくある問題と解決方法

```yaml
問題解決集:
  CIが実行されない:
    原因: "Workflow permissions不足"
    解決: "Settings → Actions → General → Workflow permissions を Read and write に変更"

  CODEOWNERSが動作しない:
    原因: "ファイルパスが間違っている"
    解決: "リポジトリルートに配置、パス記法を確認"

  Dependabotが動作しない:
    原因: "設定ファイルの構文エラー"
    解決: ".github/dependabot.yml の YAML構文を確認"

  Projectsに自動追加されない:
    原因: "Workflow automationが無効"
    解決: "Project設定でWorkflow automationを有効化"
```

---

**注意**: これらの設定は管理者権限が必要です。設定完了後は必ず動作テストを実施してください。
