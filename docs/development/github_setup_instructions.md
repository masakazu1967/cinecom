# GitHub設定手順書

## 概要

Cinecomプロジェクトの開発に必要なGitHub設定の手順を説明します。

## 1. ブランチ保護ルール設定

### mainブランチ保護

GitHubリポジトリの設定画面で以下を設定:

1. **Settings** → **Branches** → **Add rule** をクリック
2. **Branch name pattern**: `main`
3. 以下のオプションを有効化:

```yaml
保護設定:
  ✅ Require a pull request before merging
    ✅ Require approvals: 2
    ✅ Dismiss stale PR approvals when new commits are pushed
    ✅ Require review from code owners
  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    必須ステータスチェック:
      - frontend-ci
      - backend-ci  
      - security-scan
      - code-quality
  ✅ Require conversation resolution before merging
  ✅ Require signed commits
  ✅ Require linear history
  ✅ Include administrators (推奨: 無効化)
  ✅ Allow force pushes (推奨: 無効化)
  ✅ Allow deletions (推奨: 無効化)
```

### developブランチ保護

1. **Branch name pattern**: `develop`
2. 以下のオプションを有効化:

```yaml
保護設定:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ✅ Require review from code owners
  ✅ Require status checks to pass before merging
    必須ステータスチェック:
      - frontend-ci
      - backend-ci
      - code-quality
  ✅ Require conversation resolution before merging
  ✅ Include administrators
```

## 2. GitHub Projects設定（カンバンボード）

### プロジェクト作成

1. **Projects** タブ → **New project** をクリック
2. **Project name**: "Cinecom Development Board"
3. **Template**: "Team backlog" を選択
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

#### Workflow設定

1. **Settings** → **Manage access** → **Workflows** を有効化
2. 以下のworkflowsを設定:

```yaml
自動化ルール:
  Issue作成時:
    - "Backlog" カラムに追加
    - Priorityを "Medium" に設定
    
  PR作成時:
    - リンクされたIssueを "In Review" に移動
    - Assigneeを PR作者に設定
    
  PRマージ時:
    - リンクされたIssueを "Done" に移動
    - "Closed" ラベルを追加
    
  PR閉じた時（マージ以外）:
    - リンクされたIssueを "Ready" に戻す
```

## 3. チーム管理設定

### チーム作成

**Settings** → **Member privileges** → **Teams** で以下のチームを作成:

```yaml
チーム構成:
  cinecom-team:
    members: ["全メンバー"]
    permissions: "Read"
    
  architect-team:
    members: ["システムアーキテクト"]
    permissions: "Triage"
    
  backend-team:
    members: ["バックエンド開発者"]
    permissions: "Write"
    
  frontend-team:
    members: ["フロントエンド開発者"] 
    permissions: "Write"
    
  database-team:
    members: ["データベース担当者"]
    permissions: "Write"
    
  test-team:
    members: ["テスト担当者"]
    permissions: "Write"
    
  security-team:
    members: ["セキュリティ担当者"]
    permissions: "Write"
    
  devops-team:
    members: ["DevOps担当者"]
    permissions: "Admin"
    
  docs-team:
    members: ["ドキュメント担当者"]
    permissions: "Write"
    
  project-manager:
    members: ["プロジェクトマネージャー"]
    permissions: "Admin"
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

**Settings** → **Code security and analysis** で以下を有効化:

```yaml
セキュリティ機能:
  ✅ Private vulnerability reporting
  ✅ Dependency graph
  ✅ Dependabot alerts
  ✅ Dependabot security updates
  ✅ Dependabot version updates
  ✅ Code scanning (CodeQL)
  ✅ Secret scanning
  ✅ Secret scanning push protection
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