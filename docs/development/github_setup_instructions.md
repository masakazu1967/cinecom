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
      - frontend-integration
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

### feature/*ブランチ保護（推奨）

feature/*ブランチでも基本的な品質を維持するため、軽量な保護設定を推奨:

1. **Settings** → **Branches** → **Add rule** をクリック
2. **Branch name pattern**: `feature/*`
3. 以下のオプションを有効化:

```yaml
feature/*ブランチ保護設定:
  ❌ Require a pull request before merging
    理由: featureブランチは作業用のため、直接push可能
  
  ✅ Require status checks to pass（オプション）
    推奨ステータスチェック:
      - lint-check        # 軽量なlintチェック
      - type-check         # TypeScriptチェック
      - unit-tests         # ユニットテスト
    
  ❌ Require signed commits  # 個人開発では不要
  ❌ Require linear history  # featureブランチでは柔軟性重視

利点:
  - 作業中でも基本品質を維持
  - 早期のバグ発見・修正
  - mainブランチへのマージ時の問題削減
  - GitHub Actions実行時間の最適化（軽量チェックのみ）
```

### hotfix/*ブランチ保護（推奨）

本番環境の緊急修正用hotfix/*ブランチの保護設定:

1. **Settings** → **Branches** → **Add rule** をクリック  
2. **Branch name pattern**: `hotfix/*`
3. 以下のオプションを有効化:

```yaml
hotfix/*ブランチ保護設定:
  ✅ Require a pull request before merging
    理由: 緊急修正でも品質管理は必要
    承認者数: 0（単一アカウントのため）
  
  ✅ Require status checks to pass  # 緊急時でも最低限の品質保証
    必須ステータスチェック:
      - critical-tests     # 重要な機能テスト
      - security-scan      # セキュリティ脆弱性チェック
      - lint-check         # 基本的なコード品質
    
  ❌ Require signed commits  # 個人開発では不要
  ✅ Require linear history  # 緊急修正の履歴を明確に

特徴:
  - 緊急修正でも最低限の品質保証
  - mainブランチより軽量だが重要なチェックは実施
  - PRによる変更履歴の明確化
```

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
検証項目（単一アカウント・AI協調開発用）:
  ブランチ保護:
    - [ ] mainブランチに直接pushできない
    - [ ] PRなしでマージできない
    - [ ] 必須ステータスチェック（CI）が設定されている
    - [ ] Linear historyが有効になっている
    - [ ] 承認者数が0に設定されている（自己承認不可のため）

  CI/CD:
    - [ ] feature/*ブランチでCIが実行される
    - [ ] PRでフルCIが実行される（lint, test, security scan）
    - [ ] mainブランチマージ時にCDが実行される
    - [ ] SonarCloud品質ゲートが動作する
    - [ ] テスト失敗時にマージがブロックされる

  セキュリティ（Advanced Security）:
    - [ ] Dependency graphが有効
    - [ ] Dependabot alertsが有効
    - [ ] Dependabot security updatesが有効
    - [ ] Code scanning (CodeQL)がDefault設定で動作
    - [ ] Secret scanningが動作（パブリックリポジトリでは自動）
    - [ ] .github/dependabot.ymlが正しく設定されている

  GitHub Projects:
    - [ ] Cinecom Development Boardが作成されている
    - [ ] 基本カラム（Backlog, Ready, In Progress, In Review, Testing, Done）が設定されている
    - [ ] Agent, Priority, Componentフィールドが設定されている
    - [ ] Item added to project → Backlog自動化が動作
    - [ ] Pull request merged → Done自動化が動作

  エージェント協調:
    - [ ] .github/CODEOWNERSがドキュメント参照用として存在
    - [ ] .github/pull_request_template.mdが設定されている
    - [ ] Issue templateが設定されている
    - [ ] ブランチ命名規則（feature/agent-{role}-{task}）が明確
```

## トラブルシューティング

### よくある問題と解決方法

```yaml
問題解決集（単一アカウント・AI協調開発用）:
  CIが実行されない:
    原因: "GitHub Actions permissions不足"
    解決: "Settings → Actions → General → Workflow permissions を Read and write に変更"

  ブランチ保護で承認が求められる:
    原因: "Require approvals設定が有効になっている"
    解決: "単一アカウントでは自己承認不可のため、承認者数を0に設定"

  CODEOWNERSによる自動レビュー割り当てが動作しない:
    原因: "単一アカウントではCODEOWNERS機能は無効"
    解決: "これは正常動作。CODEOWNERSはドキュメント参照用のみ"

  SonarCloud連携エラー:
    原因: "SONAR_TOKEN未設定またはプロジェクト設定不備"
    解決: "Repository Secretsでトークン確認、SonarCloud側でプロジェクト作成"

  Dependabotが動作しない:
    原因: ".github/dependabot.yml構文エラー"
    解決: "YAML構文確認、package-ecosystemとdirectoryパス確認"

  GitHub Projectsに自動追加されない:
    原因: "Project Workflow automation未設定"
    解決: "Project設定 → Workflows → Default workflowsを有効化"

  Secret scanningを無効化したい:
    原因: "パブリックリポジトリでは自動有効"
    解決: "セキュリティ上、無効化は非推奨。必要に応じて.gitignoreで機密ファイル除外"

  エージェント識別ができない:
    原因: "ブランチ命名規則またはコミットメッセージが不統一"
    解決: "feature/agent-{role}-{task}形式の徹底、コミットメッセージでエージェント明記"
```

---

**注意**: これらの設定は管理者権限が必要です。設定完了後は必ず動作テストを実施してください。
