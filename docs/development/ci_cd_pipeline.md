# CI/CDパイプライン

## Cinecom プロジェクト - マイクロサービス用デプロイメント

### 概要

本ドキュメントは、CinecomプロジェクトのCI/CDパイプライン設計と実装を定義します。GitHub Actionsを基盤とした、マイクロサービス構成に最適化された継続的インテグレーション・デプロイメントシステムを詳述します。

### CI/CDアーキテクチャ

#### **パイプライン全体図**

```mermaid
graph TD
    A[Code Push] --> B[Change Detection]
    B --> C{Changed Services?}
    C -->|user-service| D[User Service Pipeline]
    C -->|movie-service| E[Movie Service Pipeline]
    C -->|actor-service| F[Actor Service Pipeline]
    C -->|scene-service| G[Scene Service Pipeline]
    C -->|review-service| H[Review Service Pipeline]
    C -->|frontend| I[Frontend Pipeline]
    
    D --> J[Build & Test]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K{Tests Pass?}
    K -->|No| L[Notify Failure]
    K -->|Yes| M[Security Scan]
    M --> N[Build Docker Images]
    N --> O{Branch?}
    O -->|feature/* PR| P[Dev Deploy]
    O -->|main merge| Q[Staging Deploy]
    O -->|main tag v*| R[Production Deploy]
    
    P --> S[Integration Tests]
    Q --> T[Acceptance Tests]
    R --> U[Production Monitoring]
```

#### **マルチサービス並列実行**

```yaml
並列実行戦略:
  変更検出: dorny/paths-filter action
  条件実行: needs + if conditions
  マトリックス戦略: 複数Node.jsバージョン・OS対応
  
効率化:
  - 変更されたサービスのみビルド・テスト
  - キャッシュ活用（node_modules, Docker layers）
  - 並列実行によるパイプライン短縮
  - 失敗時の早期停止
```

### パッケージマネージャー設定

#### **PNPM実行環境**

```yaml
PNPM設定:
  バージョン: v8系（最新LTS）
  インストール: pnpm/action-setup@v2 アクション使用
  キャッシュ戦略: ~/.pnpm-store ディレクトリ
  ロックファイル: pnpm-lock.yaml

実行環境要件:
  Node.js: 18以上
  OS: ubuntu-latest（Linux）
  権限: 読み書き権限必要

セットアップ手順:
  1. Node.jsセットアップ
  2. pnpm/action-setup@v2でpnpmインストール
  3. pnpm install --frozen-lockfileで依存関係インストール
  4. 各種pnpmコマンド実行

トラブルシューティング:
  pnpmコマンド未認識:
    - pnpm/action-setupステップが正しく実行されているか確認
    - NODE_VERSIONとPNPM_VERSIONの設定確認
  
  キャッシュ問題:
    - pnpm-lock.yamlが最新か確認
    - pnpm store pruneでキャッシュクリア
  
  権限エラー:
    - GitHub Actionsの実行権限確認
    - secrets設定の確認
```

### GitHub Actions ワークフロー

#### **メインCI/CDワークフロー**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: ['main', 'feature/**', 'hotfix/**']
  pull_request:
    branches: ['main']
  release:
    types: [published]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'
  DOCKER_REGISTRY: 'ghcr.io'
  IMAGE_PREFIX: 'cinecom'

jobs:
  # 変更検出
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      user-service: ${{ steps.changes.outputs.user-service }}
      movie-service: ${{ steps.changes.outputs.movie-service }}
      actor-service: ${{ steps.changes.outputs.actor-service }}
      scene-service: ${{ steps.changes.outputs.scene-service }}
      review-service: ${{ steps.changes.outputs.review-service }}
      frontend: ${{ steps.changes.outputs.frontend }}
      shared: ${{ steps.changes.outputs.shared }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            user-service:
              - 'services/user-service/**'
              - 'shared/**'
            movie-service:
              - 'services/movie-service/**'
              - 'shared/**'
            actor-service:
              - 'services/actor-service/**'
              - 'shared/**'
            scene-service:
              - 'services/scene-service/**'
              - 'shared/**'
            review-service:
              - 'services/review-service/**'
              - 'shared/**'
            frontend:
              - 'frontend/**'
              - 'shared/**'
            shared:
              - 'shared/**'
              - 'package.json'
              - '.github/workflows/**'

  # サービス別テストマトリックス
  test-services:
    needs: detect-changes
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: 
          - { name: 'user-service', path: 'services/user-service', changed: '${{ needs.detect-changes.outputs.user-service }}' }
          - { name: 'movie-service', path: 'services/movie-service', changed: '${{ needs.detect-changes.outputs.movie-service }}' }
          - { name: 'actor-service', path: 'services/actor-service', changed: '${{ needs.detect-changes.outputs.actor-service }}' }
          - { name: 'scene-service', path: 'services/scene-service', changed: '${{ needs.detect-changes.outputs.scene-service }}' }
          - { name: 'review-service', path: 'services/review-service', changed: '${{ needs.detect-changes.outputs.review-service }}' }
        node-version: ['18', '20']
    if: matrix.service.changed == 'true'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
          cache-dependency-path: '${{ matrix.service.path }}/pnpm-lock.yaml'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        working-directory: ${{ matrix.service.path }}
        run: pnpm install --frozen-lockfile
      
      - name: Run linting
        working-directory: ${{ matrix.service.path }}
        run: pnpm run lint
      
      - name: Run type checking
        working-directory: ${{ matrix.service.path }}
        run: pnpm run type-check
      
      - name: Run unit tests
        working-directory: ${{ matrix.service.path }}
        run: pnpm run test:unit -- --coverage
      
      - name: Run integration tests
        working-directory: ${{ matrix.service.path }}
        run: pnpm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://test:test@localhost:5432/test_${{ matrix.service.name }}
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ${{ matrix.service.path }}/coverage/lcov.info
          flags: ${{ matrix.service.name }}
          name: ${{ matrix.service.name }}-coverage

  # フロントエンドテスト
  test-frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: 'frontend/pnpm-lock.yaml'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        working-directory: frontend
        run: pnpm install --frozen-lockfile
      
      - name: Run linting
        working-directory: frontend
        run: pnpm run lint
      
      - name: Run type checking
        working-directory: frontend
        run: pnpm run type-check
      
      - name: Run unit tests
        working-directory: frontend
        run: pnpm run test -- --coverage --watchAll=false
      
      - name: Build application
        working-directory: frontend
        run: pnpm run build
        env:
          NODE_ENV: production
      
      - name: Run E2E tests
        working-directory: frontend
        run: pnpm run test:e2e
        env:
          NODE_ENV: test

  # セキュリティスキャン
  security-scan:
    needs: [detect-changes]
    runs-on: ubuntu-latest
    if: |
      needs.detect-changes.outputs.user-service == 'true' ||
      needs.detect-changes.outputs.movie-service == 'true' ||
      needs.detect-changes.outputs.actor-service == 'true' ||
      needs.detect-changes.outputs.scene-service == 'true' ||
      needs.detect-changes.outputs.review-service == 'true' ||
      needs.detect-changes.outputs.frontend == 'true'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Run pnpm audit
        run: |
          for service in services/*/; do
            if [ -f "$service/package.json" ]; then
              echo "Auditing $service"
              cd "$service"
              pnpm audit --audit-level=high
              cd - > /dev/null
            fi
          done

  # Dockerイメージビルド
  build-images:
    needs: [test-services, test-frontend, security-scan]
    runs-on: ubuntu-latest
    if: always() && (needs.test-services.result == 'success' || needs.test-services.result == 'skipped') && (needs.test-frontend.result == 'success' || needs.test-frontend.result == 'skipped') && needs.security-scan.result == 'success'
    
    strategy:
      matrix:
        service: 
          - { name: 'user-service', path: 'services/user-service', changed: '${{ needs.detect-changes.outputs.user-service }}' }
          - { name: 'movie-service', path: 'services/movie-service', changed: '${{ needs.detect-changes.outputs.movie-service }}' }
          - { name: 'actor-service', path: 'services/actor-service', changed: '${{ needs.detect-changes.outputs.actor-service }}' }
          - { name: 'scene-service', path: 'services/scene-service', changed: '${{ needs.detect-changes.outputs.scene-service }}' }
          - { name: 'review-service', path: 'services/review-service', changed: '${{ needs.detect-changes.outputs.review-service }}' }
    
    if: matrix.service.changed == 'true'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/${{ matrix.service.name }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ${{ matrix.service.path }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_VERSION=${{ env.NODE_VERSION }}
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}
```

#### **デプロイメントワークフロー**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types:
      - completed
    branches: [main]
  release:
    types: [published]

jobs:
  deploy-staging:
    if: github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.head_branch == 'main'
    runs-on: ubuntu-latest
    environment: staging
    
    strategy:
      matrix:
        service: ['user-service', 'movie-service', 'actor-service', 'scene-service', 'review-service']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Render.com
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"serviceId": "${{ secrets[format('RENDER_{0}_SERVICE_ID', matrix.service | upper | replace('-', '_'))] }}"}' \
            https://api.render.com/v1/services/deploy
      
      - name: Wait for deployment
        run: |
          # デプロイ完了待機ロジック
          sleep 60
      
      - name: Health check
        run: |
          curl -f https://staging-${{ matrix.service }}.cinecom.com/health || exit 1
      
      - name: Notify Discord
        if: always()
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
          title: "Staging Deployment"
          description: "${{ matrix.service }} deployment ${{ job.status }}"

  deploy-frontend-staging:
    if: github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.head_branch == 'main'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --confirm'
          working-directory: ./frontend

  deploy-production:
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Create deployment manifest
        run: |
          cat > deployment-manifest.json << EOF
          {
            "version": "${{ github.ref_name }}",
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "services": {
              "user-service": "$(git rev-parse HEAD:services/user-service)",
              "movie-service": "$(git rev-parse HEAD:services/movie-service)",
              "actor-service": "$(git rev-parse HEAD:services/actor-service)",
              "scene-service": "$(git rev-parse HEAD:services/scene-service)",
              "review-service": "$(git rev-parse HEAD:services/review-service)",
              "frontend": "$(git rev-parse HEAD:frontend)"
            },
            "deployer": "${{ github.actor }}",
            "commit": "${{ github.sha }}"
          }
          EOF
      
      - name: Deploy all services to production
        run: |
          # 全サービスの本番デプロイ実行
          echo "Deploying version ${{ github.ref_name }} to production"
          
          # バックエンドサービス
          for service in user movie actor scene review; do
            echo "Deploying ${service}-service"
            curl -X POST \
              -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
              -H "Content-Type: application/json" \
              -d "{\"serviceId\": \"${{ secrets[format('RENDER_PROD_{0}_SERVICE_ID', service | upper)] }}\"}" \
              https://api.render.com/v1/services/deploy
          done
          
          # フロントエンド
          cd frontend
          pnpx vercel --prod --token ${{ secrets.VERCEL_TOKEN }} --confirm
      
      - name: Store deployment history
        run: |
          mkdir -p .deployment-history
          cp deployment-manifest.json .deployment-history/${{ github.ref_name }}.json
          
          # GitHub リポジトリにコミット
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add .deployment-history/
          git commit -m "Add deployment history for ${{ github.ref_name }}"
          git push
      
      - name: Production health check
        run: |
          services=("user" "movie" "actor" "scene" "review")
          for service in "${services[@]}"; do
            echo "Health checking ${service}-service"
            curl -f https://${service}.cinecom.com/health || exit 1
          done
          
          echo "Health checking frontend"
          curl -f https://cinecom.com/api/health || exit 1
      
      - name: Notify successful deployment
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
          title: "🚀 Production Deployment Successful"
          description: |
            Version: ${{ github.ref_name }}
            Deployer: ${{ github.actor }}
            Services: All services deployed successfully
          color: 0x00ff00
```

### 環境別設定

#### **開発環境 (Development)**

```yaml
# .github/workflows/dev-deploy.yml
name: Development Deploy

on:
  pull_request:
    branches: ['main']

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Extract branch name
        shell: bash
        run: echo "BRANCH_NAME=${GITHUB_REF#refs/heads/}" >> $GITHUB_ENV
      
      - name: Create subdomain
        run: |
          # ブランチ名からサブドメイン作成
          SUBDOMAIN=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
          echo "SUBDOMAIN=$SUBDOMAIN" >> $GITHUB_ENV
      
      - name: Setup Node.js
        if: contains(github.event.head_commit.modified, 'frontend/') || contains(github.event.head_commit.modified, 'services/')
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        if: contains(github.event.head_commit.modified, 'frontend/') || contains(github.event.head_commit.modified, 'services/')
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Deploy to development environment
        run: |
          echo "Deploying to $SUBDOMAIN.cinecom-dev.com"
          # 開発環境への個別デプロイ
          # 必要に応じてビルド実行: pnpm install --frozen-lockfile && pnpm run build
          
      - name: Update PR with deployment URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Development deployment ready!\n\n**URL**: https://${{ env.SUBDOMAIN }}.cinecom-dev.com`
            })
```

#### **ステージング環境設定**

```yaml
environments:
  staging:
    url: https://staging.cinecom.com
    variables:
      NODE_ENV: staging
      DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      REDIS_URL: ${{ secrets.STAGING_REDIS_URL }}
      JWT_SECRET: ${{ secrets.STAGING_JWT_SECRET }}
    services:
      user-service: https://staging-user.cinecom.com
      movie-service: https://staging-movie.cinecom.com
      actor-service: https://staging-actor.cinecom.com
      scene-service: https://staging-scene.cinecom.com
      review-service: https://staging-review.cinecom.com
```

#### **本番環境設定**

```yaml
environments:
  production:
    url: https://cinecom.com
    protection_rules:
      - type: required_reviewers
        reviewers: ['human-reviewer']
      - type: wait_timer
        wait_timer: 5  # 5分待機
    variables:
      NODE_ENV: production
      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
      REDIS_URL: ${{ secrets.PROD_REDIS_URL }}
      JWT_SECRET: ${{ secrets.PROD_JWT_SECRET }}
    services:
      user-service: https://user.cinecom.com
      movie-service: https://movie.cinecom.com
      actor-service: https://actor.cinecom.com
      scene-service: https://scene.cinecom.com
      review-service: https://review.cinecom.com
```

### テスト戦略

#### **テストレベル別実行**

```yaml
Unit Tests:
  実行タイミング: 全プッシュ・PR作成時
  対象: 個別関数・クラス・コンポーネント
  ツール: Jest, React Testing Library
  カバレッジ目標: 80%以上
  実行時間目標: 5分以内

Integration Tests:
  実行タイミング: PR・main マージ時
  対象: サービス間連携・API エンドポイント
  ツール: Jest + Supertest, Docker Compose
  環境: テスト用データベース・Redis
  実行時間目標: 15分以内

E2E Tests:
  実行タイミング: ステージングデプロイ後
  対象: ユーザーシナリオ・画面遷移
  ツール: Playwright, Cypress
  環境: ステージング環境
  実行時間目標: 30分以内

Performance Tests:
  実行タイミング: リリース前・週次
  対象: API レスポンス時間・スループット
  ツール: Artillery, k6
  基準: 95%ile < 500ms
  実行時間目標: 20分以内
```

#### **テストデータ管理**

```yaml
Test Database:
  戦略: テスト実行毎に初期化
  実装: 
    - Docker Compose でテスト用DB起動
    - マイグレーション実行
    - テストフィクスチャ投入
    - テスト実行
    - DB破棄

Test Fixtures:
  場所: tests/fixtures/
  フォーマット: JSON, YAML
  管理: サービス別・シナリオ別
  バリエーション: 正常系・異常系・境界値

Mock Services:
  外部API: MSW (Mock Service Worker)
  内部サービス: Jest Manual Mocks
  データベース: テスト専用DB使用
```

### パフォーマンス最適化

#### **ビルド高速化**

```yaml
キャッシュ戦略:
  Node.js Dependencies:
    - actions/setup-node cache
    - ~/.pnpm-store, node_modules
    - pnpm-lock.yaml ベース
  
  Docker Layers:
    - Docker Buildx cache
    - レジストリキャッシュ
    - レイヤー最適化
  
  Test Results:
    - Jest cache
    - 変更ファイルのみテスト
    - 並列実行

並列実行:
  Matrix Strategy:
    - サービス別並列実行
    - Node.js バージョン別
    - OS別（必要に応じて）
  
  Job Dependencies:
    - 必要最小限の依存関係
    - 早期失敗による時間短縮
    - 条件付き実行
```

#### **デプロイ最適化**

```yaml
Blue-Green Deployment:
  ステージング:
    - 新バージョンデプロイ
    - ヘルスチェック
    - トラフィック切り替え
  
  本番:
    - カナリアデプロイ
    - 段階的トラフィック移行
    - 自動ロールバック

Zero-Downtime Deployment:
  戦略:
    - ローリングアップデート
    - ヘルスチェック統合
    - Graceful Shutdown
  
  監視:
    - リアルタイムメトリクス
    - エラー率監視
    - 自動アラート
```

### 監視・メトリクス

#### **CI/CDメトリクス**

```yaml
Pipeline Metrics:
  - ビルド成功率: 95%以上
  - 平均ビルド時間: 10分以内
  - デプロイ成功率: 98%以上
  - 平均デプロイ時間: 5分以内

Quality Metrics:
  - テスト成功率: 100%
  - カバレッジ率: 80%以上
  - セキュリティスキャン通過率: 100%
  - コード品質スコア: A以上

Deployment Metrics:
  - デプロイ頻度: 週2-3回
  - 変更リードタイム: 24時間以内
  - 復旧時間(MTTR): 1時間以内
  - 変更失敗率: 5%以下
```

#### **アラート設定**

```yaml
Critical Alerts:
  - Pipeline失敗: 即座Discord通知
  - セキュリティ脆弱性検出: 即座Discord + メール
  - 本番デプロイ失敗: 即座Discord + PagerDuty
  - ヘルスチェック失敗: 即座Discord

Warning Alerts:
  - テストカバレッジ低下: Discord通知
  - ビルド時間長期化: 週次レポート
  - デプロイ頻度低下: 週次レポート
```

### セキュリティスキャン戦略

#### **ワークフロー分離によるセキュリティ最適化**

Cinecomプロジェクトでは、セキュリティスキャンを **2つの独立したワークフロー** に分離し、効率的かつ段階的なセキュリティ検査を実現します。

##### **Phase 1: security-scan.yml（基本・高速セキュリティスキャン）**

```yaml
目的: 高速な脆弱性検出とPRレビュー効率化
実行時間: 2-5分
実行タイミング: 
  - 全てのPRで実行
  - feature/*ブランチでも実行
  - 高速フィードバックが重要

スキャン内容:
  CodeQL分析:
    - TypeScript/JavaScript脆弱性検出
    - SAST (Static Application Security Testing)
    - GitHub標準、設定簡単
    
  依存関係スキャン:
    - pnpm audit（全バックエンドサービス対象）
    - 既知の脆弱性ライブラリ検出
    - 高・重大レベルの脆弱性のみアラート
    
  シークレット検出:
    - GitHub Secret Scanning（標準装備）
    - TruffleHog または GitLeaks
    - API キー・認証情報の検出
    
  ESLint Security:
    - ESLint security plugin
    - JavaScript/TypeScript セキュリティルール
    - コード品質とセキュリティの同時チェック

保護ルール設定:
  - ブランチ保護の必須チェック対象
  - 失敗時はマージブロック
  - すべてのサービスで統一実行
```

##### **Phase 2: sonarcloud.yml（詳細・品質重視セキュリティ分析）**

```yaml
目的: 詳細な品質・セキュリティ分析と品質ゲート
実行時間: 10-20分（大規模プロジェクトでは30分以上）
実行タイミング:
  - mainブランチへのマージ時に実行
  - 詳細な品質分析が必要なタイミング
  - 品質ゲートでのマージブロック

分析内容:
  品質分析:
    - コード重複率、複雑度分析
    - 保守性、信頼性評価
    - 技術的負債の算出
    
  セキュリティ分析:
    - セキュリティホットスポット検出
    - セキュリティ品質評価
    - 脆弱性パターンの詳細分析
    
  品質ゲート:
    - 新規コードの品質基準
    - カバレッジ率の維持
    - セキュリティ評価のしきい値設定

環境要件:
  - Java環境（SonarScanner用）
  - 大量のファイル解析処理
  - SonarCloud外部連携
```

#### **ワークフロー分離の利点**

##### **1. 実行効率の最適化**
```yaml
並列実行:
  - security-scanとsonarcloudが同時実行
  - 一方が失敗しても他方は継続
  - GitHub Actions実行時間の効率利用

段階的フィードバック:
  - 基本セキュリティ: 5分で重大脆弱性検出
  - 詳細分析: 15分で品質・セキュリティ総合評価
```

##### **2. コスト効率とリソース管理**
```yaml
無料枠活用:
  - GitHub Actions月2,000分制限への配慮
  - 重い処理（SonarCloud）は必要時のみ実行
  - 軽量処理（基本スキャン）は頻繁実行

リソース配分:
  - feature/ブランチ: 基本セキュリティのみ
  - mainブランチ: 両方実行
  - 緊急修正時: 基本セキュリティで高速対応
```

##### **3. 柔軟な運用管理**
```yaml
運用シナリオ:
  緊急修正時:
    - security-scan: 必須（高速脆弱性チェック）
    - sonarcloud: 一時的無効化可能
    
  通常開発時:
    - security-scan: 全PR必須
    - sonarcloud: mainマージ時必須
    
  品質重視期間:
    - 両方を厳格運用
    - 品質ゲート基準引き上げ
```

#### **ブランチ保護ルール設定**

```yaml
mainブランチ保護ルール:
  必須ステータスチェック:
    # フロントエンド
    - frontend-integration
    
    # バックエンドサービス
    - user-service-integration
    - movie-service-integration  
    - actor-service-integration
    - scene-service-integration
    - review-service-integration
    
    # セキュリティ（分離型）
    - security-scan              # ← 基本・高速（必須）
    - sonarcloud                 # ← 詳細・品質（必須）
    
  設定の利点:
    - 段階的なセキュリティ検証
    - 運用負荷の分散
    - 緊急時の柔軟な対応
```

#### **実装ロードマップ**

##### **Phase 1: 基本セキュリティ実装**
```yaml
Week 1-2:
  - security-scan.yml作成
  - CodeQL、pnpm audit、secret scanning
  - ESLint security plugin統合
  - ブランチ保護ルール設定

期待効果:
  - 重大脆弱性の早期検出
  - 開発効率の維持
  - セキュリティ意識の向上
```

##### **Phase 2: 詳細品質分析実装**
```yaml
Week 3-4:
  - SonarCloudプロジェクト設定
  - sonarcloud.yml作成
  - 品質ゲート設定
  - 詳細レポート連携

期待効果:
  - 総合的な品質向上
  - 技術的負債の管理
  - 継続的品質改善
```

#### **パイプラインセキュリティ**

```yaml
Secret Management:
  - GitHub Secrets使用
  - 環境別Secret分離
  - 最小権限原則
  - 定期Secret ローテーション

Vulnerability Scanning:
  - Dependency scanning (pnpm audit)
  - Container scanning (Trivy)
  - Code scanning (CodeQL)
  - Secret scanning (TruffleHog)

Access Control:
  - Branch protection rules
  - Required reviews
  - Environment protection
  - Audit logging
```

#### **コンプライアンス**

```yaml
監査要件:
  - 全デプロイのトレーサビリティ
  - 変更承認履歴
  - セキュリティスキャン結果
  - アクセスログ

ドキュメント要件:
  - Pipeline設定ドキュメント
  - 緊急時手順書
  - セキュリティポリシー
  - 変更管理プロセス
```

### トラブルシューティング

#### **よくある問題と対処法**

```yaml
Build Failures:
  依存関係問題:
    - pnpm-lock.yaml 更新
    - キャッシュクリア (pnpm store prune)
    - Node.js バージョン確認
  
  Test Failures:
    - ローカル再現確認
    - テストデータ問題調査
    - 環境差異確認

Deploy Failures:
  Authentication:
    - Secret 有効性確認
    - 権限設定確認
  
  Environment Issues:
    - リソース不足確認
    - 外部サービス依存確認
    - ネットワーク接続確認

Performance Issues:
  Build Slowness:
    - キャッシュ効率確認
    - 並列実行設定最適化
    - 不要処理削除
  
  Deploy Slowness:
    - イメージサイズ最適化
    - ネットワーク確認
    - リソース設定確認
```

### 関連ドキュメント

- **Git ワークフロー**: `/docs/development/git_workflow.md` - ブランチ戦略・マージプロセス
- **テスト戦略**: `/docs/development/testing_strategy.md` - テスト詳細仕様
- **デプロイガイド**: `/docs/operations/deployment_guide.md` - インフラ運用詳細
- **監視システム**: `/docs/operations/monitoring_setup.md` - システム監視設定

### 更新履歴

- **v1.0** (2025-08-22): 初版作成 - GitHub Actions マイクロサービス用パイプライン
- **次回更新予定**: Phase 1完了時（Week 2終了時）- 実運用結果による最適化

---

**重要**: CI/CDパイプラインは継続的改善が重要です。メトリクスを定期的に評価し、開発効率と品質向上に向けて最適化を続けてください。
