# 運用向けMCP Server活用ガイド

## 概要

本番環境・運用フェーズにおけるMCP Serverは、システムの監視・管理・保守・セキュリティを自動化・効率化するためのツールです。24/7運用の安定性確保とインシデント対応の迅速化を実現します。

## 推奨MCP Server一覧

### 最優先導入（Tier 1）

#### 1. **Sentry MCP Server** ⭐️

**概要**: エラー監視・AI駆動デバッグ

- **リアルタイムエラー監視**: 全マイクロサービスの例外・エラー追跡
- **AI自動修正（Seer統合）**: 根本原因分析と修正提案
- **パフォーマンス監視**: レスポンス時間・スループット分析
- **アラート自動化**: 重要度に応じた通知・エスカレーション

#### 2. **mcp-prometheus**

**概要**: システム監視・メトリクス収集

- **リソース監視**: CPU・メモリ・ディスク使用率
- **アプリケーション監視**: レスポンス時間・エラー率・QPS
- **カスタムメトリクス**: ビジネス指標の監視
- **アラートルール**: 閾値ベースの自動アラート

#### 3. **mcp-postgres-admin**

**概要**: PostgreSQL本番運用管理

- **バックアップ管理**: 自動バックアップ・復旧テスト
- **パフォーマンス分析**: スロークエリ・インデックス分析
- **容量監視**: ストレージ使用量・成長予測
- **セキュリティ**: 接続監視・権限管理

#### 4. **mcp-docker-compose**

**概要**: 本番コンテナ環境管理

- **安全な再起動**: グレースフル再起動・ローリング更新
- **スケーリング**: 負荷に応じた自動スケーリング
- **ヘルスチェック**: コンテナ状態監視・自動復旧
- **リソース最適化**: コンテナリソース配分調整

### 段階的導入（Tier 2）

#### 5. **mcp-grafana**

**概要**: 可視化ダッシュボード・レポート

- **運用ダッシュボード**: システム状態の統合表示
- **ビジネスダッシュボード**: KPI・売上・ユーザー指標
- **アラート可視化**: インシデントの時系列表示
- **レポート自動生成**: 定期的な運用レポート作成

#### 6. **mcp-elasticsearch**

**概要**: ログ管理・分析・検索

- **集約ログ管理**: 全サービスのログ一元化
- **異常検知**: ログパターン分析による異常検出
- **トレーサビリティ**: リクエスト追跡・エラー調査
- **パフォーマンス分析**: ログベースの性能分析

#### 7. **mcp-discord**

**概要**: 運用チーム通知・コミュニケーション

- **インシデント通知**: 重要度別の自動通知
- **定期レポート**: 日次・週次の自動レポート投稿
- **運用コマンド**: Discord経由でのシステム操作
- **エスカレーション**: 未対応インシデントの自動エスカレーション

#### 8. **mcp-redis-admin**

**概要**: Redis運用監視・最適化

- **キャッシュ監視**: ヒット率・メモリ使用量分析
- **パフォーマンス最適化**: キー分析・TTL最適化
- **可用性管理**: レプリケーション状態監視
- **データ整合性**: キャッシュとDB間の整合性チェック

### 高度運用（Tier 3）

#### 9. **mcp-kubernetes**

**概要**: K8sクラスター管理・オーケストレーション

- **クラスター監視**: Pod・Node・Service状態管理
- **自動スケーリング**: HPA・VPA・Cluster Autoscaler連携
- **デプロイメント管理**: Blue-Green・カナリアデプロイメント
- **リソース最適化**: Resource Request/Limit調整

#### 10. **mcp-security-scanner**

**概要**: セキュリティ監視・脆弱性管理

- **脆弱性スキャン**: 依存関係・イメージの定期スキャン
- **セキュリティ監査**: アクセスログ・権限変更の監査
- **コンプライアンス**: SOC2・ISO27001対応チェック
- **侵入検知**: 異常アクセスパターンの検出

#### 11. **mcp-backup-manager**

**概要**: バックアップ・災害復旧管理

- **自動バックアップ**: データベース・ファイルシステム
- **復旧テスト**: 定期的な復旧可能性テスト
- **災害復旧**: RTO・RPO管理・フェイルオーバー
- **データ保持**: 法令遵守の保持期間管理

#### 12. **mcp-audit-logger**

**概要**: 監査ログ・コンプライアンス

- **操作ログ記録**: 全システム操作の監査ログ
- **改ざん防止**: ログの暗号化・デジタル署名
- **アクセス制御**: ログアクセスの権限管理
- **法令遵守**: GDPR・PCI DSS対応ログ管理

## 導入方法

### Claude Codeでの運用向け導入

```bash
# Sentry MCP Server（最優先）
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Prometheus監視
claude mcp add --transport stdio prometheus "prometheus-mcp --config /etc/prometheus/prometheus.yml"

# PostgreSQL管理
claude mcp add --transport stdio postgres-admin "postgres-admin-mcp --connection postgresql://user:pass@localhost:5432/cinecom_prod"

# Docker環境管理
claude mcp add --transport stdio docker "docker-compose-mcp --file docker-compose.prod.yml"

# Grafana可視化
claude mcp add --transport http grafana http://grafana.example.com/mcp

# Discord通知
claude mcp add --transport stdio discord "discord-mcp --webhook $DISCORD_WEBHOOK_URL"
```

### 環境別設定

#### Production環境

```json
{
  "servers": {
    "sentry": {
      "transport": "http",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": true,
      "priority": "high"
    },
    "prometheus": {
      "transport": "stdio",
      "command": "prometheus-mcp",
      "args": ["--config", "/etc/prometheus/prometheus.yml"],
      "restart": "always"
    },
    "postgres": {
      "transport": "stdio",
      "command": "postgres-admin-mcp",
      "args": ["--connection", "$DATABASE_URL"],
      "security": "high"
    }
  }
}
```

#### Staging環境

```json
{
  "servers": {
    "sentry": {
      "transport": "http",
      "url": "https://mcp.sentry.dev/mcp",
      "project": "cinecom-staging"
    },
    "prometheus": {
      "transport": "stdio",
      "command": "prometheus-mcp",
      "args": ["--config", "/etc/prometheus/prometheus-staging.yml"]
    }
  }
}
```

## 設定方法

### 1. 環境変数・認証情報

```bash
# .env.production
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
PROMETHEUS_URL="http://prometheus:9090"
GRAFANA_API_TOKEN="xxxxx"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxxxx"
DATABASE_URL="postgresql://user:pass@postgres:5432/cinecom_prod"
REDIS_URL="redis://redis:6379"

# セキュリティ関連
MCP_AUTH_TOKEN="xxxxx"
MCP_ENCRYPTION_KEY="xxxxx"
AUDIT_LOG_KEY="xxxxx"
```

### 2. Prometheus設定

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  external_labels:
    environment: 'production'
    project: 'cinecom'

scrape_configs:
  - job_name: 'cinecom-frontend'
    static_configs:
      - targets: ['frontend:3000']

  - job_name: 'cinecom-user-service'
    static_configs:
      - targets: ['user-service:3001']

  - job_name: 'cinecom-movie-service'
    static_configs:
      - targets: ['movie-service:3002']

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

### 3. アラートルール

```yaml
# alert_rules.yml
groups:
  - name: cinecom-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"

      - alert: DatabaseConnectionFail
        expr: postgres_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL connection failed"
```

### 4. Grafana ダッシュボード設定

```json
{
  "dashboard": {
    "title": "Cinecom Production Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Errors/sec"
          }
        ]
      }
    ]
  }
}
```

## 運用の仕方

### 日常運用パターン

#### 1. **朝の運用確認**

```
Claude問い合わせ: 「昨夜のシステム状況を報告して」
→ Sentry + Prometheus + Grafanaが連携して
- エラー発生状況
- パフォーマンス指標
- リソース使用状況
を自動レポート
```

#### 2. **インシデント対応**

```
アラート受信: 「映画サービスでエラー率上昇」
Claude対応: 「movie-serviceのエラー詳細を調査して」
→ Sentry MCPが自動で
- エラーの根本原因分析
- Seer AIによる修正提案
- 関連するログ・メトリクス表示
```

#### 3. **パフォーマンス最適化**

```
Claude分析: 「データベースの性能問題を分析して」
→ postgres-admin MCPが
- スロークエリ特定
- インデックス最適化提案
- 容量使用予測
```

#### 4. **定期メンテナンス**

```
Claude実行: 「安全にシステム更新を実行して」
→ docker-compose MCPが
- グレースフル再起動
- ヘルスチェック確認
- ロールバック準備
```

### インシデント管理フロー

#### レベル1: 軽微な問題

1. **自動検知**: Prometheus → Sentry連携
2. **初期対応**: AI分析による影響範囲特定
3. **自動修復**: 可能な場合は自動修復実行
4. **通知**: Discord/Slackに状況報告

#### レベル2: 重要な問題

1. **即座通知**: 運用チーム全体にアラート
2. **詳細分析**: Sentry MCPによる根本原因分析
3. **修復実行**: AI提案を元に修復作業
4. **ポストモーテム**: 自動レポート生成

#### レベル3: クリティカル

1. **緊急通知**: オンコール対応者に即座通知
2. **戦術室設置**: Discord/Slack緊急チャンネル
3. **並行対応**: 複数MCP Server同時活用
4. **復旧確認**: 全システムヘルスチェック

### 定期作業の自動化

#### 日次作業

- **システムヘルスチェック**: 全サービス稼働確認
- **バックアップ確認**: DB・ファイル バックアップ成功確認
- **セキュリティスキャン**: 新規脆弱性チェック
- **パフォーマンスレポート**: 前日比パフォーマンス分析

#### 週次作業

- **容量使用量レビュー**: ストレージ・メモリ使用予測
- **セキュリティ監査**: アクセスログ・権限変更レビュー
- **依存関係更新**: セキュリティパッチ適用計画
- **災害復旧テスト**: バックアップからの復旧テスト

#### 月次作業

- **パフォーマンス分析**: 月次傾向分析・キャパシティプランニング
- **セキュリティ評価**: 包括的セキュリティ評価
- **コスト最適化**: リソース使用量とコスト分析
- **災害復旧訓練**: 本格的な災害復旧シミュレーション

## 運用ベストプラクティス

### 1. **段階的導入戦略**

```
フェーズ1: 基盤監視（Sentry + Prometheus + Postgres-admin）
フェーズ2: 可視化強化（Grafana + Discord通知）
フェーズ3: 高度分析（Elasticsearch + Security Scanner）
フェーズ4: 全自動化（K8s + Backup Manager + Audit Logger）
```

### 2. **冗長性・可用性確保**

- **MCP Server自体の監視**: MCP Serverの稼働状況監視
- **フェイルオーバー**: 主要MCP Serverの冗長化
- **オフライン対応**: MCP Server停止時の手動手順整備

### 3. **セキュリティ・コンプライアンス**

- **アクセス制御**: MCP Server接続の最小権限化
- **監査ログ**: 全MCP Server操作の監査ログ記録
- **暗号化**: 通信・保存データの暗号化

### 4. **パフォーマンス最適化**

- **同時接続制限**: 本番環境では3-5個のMCP Server
- **キャッシュ活用**: 頻繁なクエリ結果のキャッシュ
- **リソース監視**: MCP Server自体のリソース使用監視

## トラブルシューティング

### よくある問題と対処法

#### 1. **MCP Server接続エラー**

```bash
# 診断コマンド
claude mcp status
claude mcp logs <server-name>

# 対処法
- 認証情報確認
- ネットワーク疎通確認
- サーバー再起動
```

#### 2. **パフォーマンス低下**

```bash
# リソース確認
claude mcp metrics
top -p $(pgrep -f mcp)

# 対処法
- 同時接続数削減
- キャッシュクリア
- タイムアウト調整
```

#### 3. **認証エラー**

```bash
# OAuth再認証
claude mcp auth refresh <server-name>

# トークン確認
echo $MCP_AUTH_TOKEN
```

### 緊急時対応手順

#### システム障害時

1. **手動確認**: MCP Serverに依存しない確認手順実行
2. **代替手段**: 従来のCLI・GUI管理ツール使用
3. **段階的復旧**: 最重要MCPから順次復旧
4. **事後検証**: 障害原因分析・改善策実装

## セキュリティ考慮事項

### 認証・認可

- **OAuth 2.0**: 可能な限りOAuth認証使用
- **API Key管理**: 定期的なキーローテーション
- **最小権限**: 必要最小限の権限のみ付与

### ネットワークセキュリティ

- **VPN経由**: 本番MCP Server接続はVPN経由
- **IP制限**: 信頼できるIPアドレスからのみ接続許可
- **TLS暗号化**: 全通信の暗号化

### 監査・ログ

- **操作ログ**: 全MCP Server操作の詳細ログ
- **アクセスログ**: 接続・認証の履歴記録
- **改ざん検知**: ログの整合性チェック

---

## 参考リンク

- [Sentry MCP Server Documentation](https://docs.sentry.io/product/sentry-mcp/)
- [Prometheus MCP Integration](https://prometheus.io/docs/guides/mcp/)
- [Model Context Protocol Security Best Practices](https://modelcontextprotocol.io/security/)
- [Claude Code Production Operations](https://docs.anthropic.com/en/docs/claude-code/operations/)
