# モニタリング・メトリクス

## Cinecom プロジェクト - システム監視・分析

### 概要

本ドキュメントは、Cinecomプロジェクトのモニタリング戦略とメトリクス定義を詳述します。マイクロサービス構成での包括的な監視システムにより、システムの健全性・パフォーマンス・ビジネス価値を継続的に測定・改善します。

### 監視戦略

#### **監視の4つのレイヤー（優先度順）**

**監視優先度の基本方針**: ビジネスKPI主導、技術指標はサポート役

```yaml
1. ビジネス監視（最重要）:
   対象: ユーザー行動・ビジネス価値・KPI
   メトリクス: ユーザー数, 検索回数, 登録数
   優先度: 最高 - ビジネス価値直結

2. アプリケーション監視（重要）:
   対象: マイクロサービス・API・データベース
   メトリクス: レスポンス時間, エラー率, スループット
   優先度: 高 - ユーザー体験直結

3. セキュリティ監視（重要）:
   対象: 不正アクセス・脆弱性・コンプライアンス
   メトリクス: 失敗ログイン, 異常パターン, セキュリティイベント
   優先度: 高 - リスク管理

4. インフラ監視（サポート）:
   対象: サーバー・ネットワーク・ストレージ
   メトリクス: CPU, Memory, Disk, Network
   優先度: 中 - 上位レイヤーの原因分析・予防保全
```

**階層型監視アプローチ**:

- ビジネス異常 → アプリケーション分析 → インフラ調査の順序
- 技術指標はビジネス影響の原因特定・予防のサポート役

#### **観測可能性 (Observability) の3つの柱**

```yaml
Metrics (メトリクス):
  - 数値データの時系列収集
  - システム状態の定量的把握
  - トレンド分析・アラート基準

Logs (ログ):
  - イベント・エラーの詳細記録
  - 問題の根本原因分析
  - 監査証跡・デバッグ情報

Traces (トレース):
  - リクエストの分散追跡
  - マイクロサービス間の処理フロー
  - パフォーマンスボトルネック特定
```

### メトリクス分類・定義

#### **インフラストラクチャメトリクス**

**システムリソース**:

```yaml
CPU メトリクス:
  - cpu_usage_percent: CPU使用率（%）
    - 目標: 平均60%以下、ピーク80%以下
    - 監視間隔: 1分
    - アラート: 85%超過で警告、95%超過で重大

  - cpu_load_average: ロードアベレージ
    - 目標: 1分平均がCPUコア数以下
    - 監視間隔: 1分

Memory メトリクス:
  - memory_usage_percent: メモリ使用率（%）
    - 目標: 平均70%以下、ピーク85%以下
    - アラート: 90%超過で警告、95%超過で重大

  - memory_available_bytes: 利用可能メモリ（bytes）
  - swap_usage_percent: スワップ使用率（%）
    - 目標: 10%以下

Disk メトリクス:
  - disk_usage_percent: ディスク使用率（%）
    - 目標: 80%以下
    - アラート: 85%超過で警告、90%超過で重大

  - disk_io_read_bytes_per_sec: 読み取りI/O（bytes/sec）
  - disk_io_write_bytes_per_sec: 書き込みI/O（bytes/sec）

Network メトリクス:
  - network_bytes_received_per_sec: 受信バイト（bytes/sec）
  - network_bytes_sent_per_sec: 送信バイト（bytes/sec）
  - network_connections_active: アクティブ接続数
```

**コンテナメトリクス**:

```yaml
Docker メトリクス:
  - container_cpu_usage: コンテナCPU使用率
  - container_memory_usage: コンテナメモリ使用量
  - container_network_io: コンテナネットワークI/O
  - container_restart_count: コンテナ再起動回数
    - 目標: 1日1回以下
    - アラート: 1時間に3回以上で警告

Pod メトリクス (Kubernetes使用時):
  - pod_cpu_requests: CPU要求量
  - pod_memory_requests: メモリ要求量
  - pod_ready_status: Pod準備状態
  - pod_phase: Podフェーズ（Running/Pending/Failed）
```

#### **アプリケーションメトリクス**

**HTTP API メトリクス**:

```yaml
レスポンス時間:
  - http_request_duration_seconds: HTTPリクエスト処理時間
    - ラベル: method, path, status_code, service
    - 目標: 段階的（Phase 1: 500ms → Phase 2: 300ms → Phase 3: 200ms）
    - 監視: ヒストグラム（バケット: 0.1, 0.5, 1, 2, 5秒）

スループット:
  - http_requests_total: 総リクエスト数
    - ラベル: method, path, status_code, service
    - 監視間隔: 1分間隔のレート

エラー率:
  - http_requests_error_rate: エラー率（%）
    - 計算: 5xx errors / total requests * 100
    - 目標: 0.1%以下
    - アラート: 1%超過で警告、5%超過で重大

可用性:
  - http_service_availability: サービス可用性（%）
    - 計算: (total - 5xx errors) / total * 100
    - 目標: 99.9%以上
```

**マイクロサービス固有メトリクス**:

```yaml
user-service:
  - authentication_attempts_total: 認証試行回数
  - authentication_success_rate: 認証成功率（%）
    - 目標: 98%以上
  - jwt_token_issued_total: JWTトークン発行数
  - oauth_login_total: OAuth ログイン数
  - user_registration_total: ユーザー登録数

movie-service:
  - movie_search_requests_total: 映画検索リクエスト数
  - movie_search_duration_seconds: 検索処理時間
    - 目標: 95%ile < 400ms
  - movie_cache_hit_rate: キャッシュヒット率（%）
    - 目標: 80%以上
  - movie_database_queries_total: DB クエリ実行数

actor-service:
  - actor_search_requests_total: 俳優検索リクエスト数
  - filmography_requests_total: フィルモグラフィー取得数
  - cast_relation_queries_total: キャスト関係クエリ数

scene-service:
  - scene_search_requests_total: シーン検索リクエスト数
  - scene_categorization_requests_total: シーン分類リクエスト数
  - scene_recommendation_requests_total: シーン推薦リクエスト数

review-service:
  - review_submission_total: レビュー投稿数
  - rating_calculation_duration_seconds: 評価計算時間
  - watchlist_operations_total: ウォッチリスト操作数
```

#### **データベースメトリクス**

**PostgreSQL メトリクス**:

```yaml
接続・パフォーマンス:
  - postgresql_connections_active: アクティブ接続数
    - 目標: 最大接続数の70%以下
  - postgresql_connections_max: 最大接続数設定値
  - postgresql_query_duration_seconds: クエリ実行時間
    - 目標: 95%ile < 200ms
  - postgresql_slow_queries_total: スロークエリ数
    - 目標: 1時間あたり10件以下

データベース統計:
  - postgresql_database_size_bytes: データベースサイズ
  - postgresql_table_size_bytes: テーブルサイズ
  - postgresql_index_usage_rate: インデックス使用率（%）
    - 目標: 95%以上
  - postgresql_cache_hit_rate: キャッシュヒット率（%）
    - 目標: 95%以上

トランザクション:
  - postgresql_transactions_total: トランザクション総数
  - postgresql_transaction_rollback_rate: ロールバック率（%）
    - 目標: 1%以下
  - postgresql_deadlocks_total: デッドロック発生数
    - 目標: 1日1件以下
```

**Redis メトリクス**:

```yaml
パフォーマンス:
  - redis_commands_processed_total: 処理コマンド総数
  - redis_command_duration_seconds: コマンド実行時間
  - redis_keyspace_hits_total: キーヒット数
  - redis_keyspace_misses_total: キーミス数
  - redis_hit_rate: ヒット率（%）
    - 計算: hits / (hits + misses) * 100
    - 目標: 90%以上

メモリ使用:
  - redis_memory_used_bytes: 使用メモリ量
  - redis_memory_max_bytes: 最大メモリ設定
  - redis_memory_fragmentation_ratio: メモリ断片化率
    - 目標: 1.5以下

接続:
  - redis_connected_clients: 接続クライアント数
  - redis_blocked_clients: ブロッククライアント数
  - redis_rejected_connections_total: 拒否接続数
```

#### **ビジネスメトリクス**

**ユーザー行動メトリクス**:

```yaml
エンゲージメント:
  - daily_active_users: 日次アクティブユーザー数
  - weekly_active_users: 週次アクティブユーザー数
  - monthly_active_users: 月次アクティブユーザー数
  - session_duration_seconds: セッション継続時間
    - 目標: 平均5分以上
  - page_views_total: ページビュー総数
  - bounce_rate: 直帰率（%）
    - 目標: 60%以下

検索・発見:
  - search_queries_total: 検索クエリ総数
  - search_results_clicked_total: 検索結果クリック数
  - search_success_rate: 検索成功率（%）
    - 計算: クリックされた検索 / 総検索 * 100
    - 目標: 70%以上
  - recommendation_clicks_total: 推薦コンテンツクリック数

コンテンツ利用:
  - movie_details_views_total: 映画詳細ページビュー数
  - actor_profiles_views_total: 俳優プロフィールビュー数
  - scene_views_total: シーン詳細ビュー数
  - watchlist_additions_total: ウォッチリスト追加数
  - reviews_submitted_total: レビュー投稿数
```

**ビジネス価値メトリクス**:

```yaml
成長指標:
  - user_registrations_total: ユーザー登録数
  - user_retention_rate_7d: 7日間ユーザー継続率（%）
    - 目標: 60%以上
  - user_retention_rate_30d: 30日間ユーザー継続率（%）
    - 目標: 40%以上

コンテンツ品質:
  - content_rating_average: コンテンツ平均評価
    - 目標: 4.0以上（5点満点）
  - reviews_per_movie_average: 映画あたり平均レビュー数
    - 目標: 5件以上
  - high_quality_reviews_ratio: 高品質レビュー率（%）
    - 定義: 100文字以上のレビュー
    - 目標: 60%以上

機能利用:
  - feature_adoption_rate: 機能採用率（%）
    - 対象: シーン検索、レビュー機能等
  - advanced_search_usage_rate: 高度検索利用率（%）
  - mobile_usage_rate: モバイル利用率（%）
```

### 監視ツール・インフラ

#### **メトリクス収集システム**

**Prometheus 設定**:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:3001']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'movie-service'
    static_configs:
      - targets: ['movie-service:3002']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

**Node.js メトリクス実装**:

```typescript
// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  // HTTPリクエスト関連
  private httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code', 'service'],
  });

  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'status_code', 'service'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  // ビジネス関連
  private userRegistrations = new Counter({
    name: 'user_registrations_total',
    help: 'Total number of user registrations',
  });

  private searchQueries = new Counter({
    name: 'search_queries_total',
    help: 'Total number of search queries',
    labelNames: ['search_type', 'service'],
  });

  // データベース関連
  private dbConnectionsActive = new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
    labelNames: ['database', 'service'],
  });

  recordHttpRequest(method: string, path: string, statusCode: number, duration: number, service: string) {
    this.httpRequestTotal.labels(method, path, statusCode.toString(), service).inc();
    this.httpRequestDuration.labels(method, path, statusCode.toString(), service).observe(duration);
  }

  recordUserRegistration() {
    this.userRegistrations.inc();
  }

  recordSearchQuery(searchType: string, service: string) {
    this.searchQueries.labels(searchType, service).inc();
  }

  setDatabaseConnections(count: number, database: string, service: string) {
    this.dbConnectionsActive.labels(database, service).set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}

// metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordHttpRequest(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration,
        process.env.SERVICE_NAME || 'unknown'
      );
    });

    next();
  }
}
```

#### **ダッシュボード設計**

**Grafana ダッシュボード構成**:

```yaml
システム概要ダッシュボード:
  目的: システム全体の健全性一目把握
  期間: 直近24時間（リアルタイム更新）

  パネル構成:
    - サービス稼働状況（緑/赤ステータス）
    - 全体エラー率・レスポンス時間
    - リクエスト総数・アクティブユーザー数
    - システムリソース使用率
    - 重要アラート一覧

マイクロサービス詳細ダッシュボード:
  目的: 各サービスの詳細監視
  構成: サービス別個別ダッシュボード

  共通パネル:
    - API エンドポイント別レスポンス時間
    - エラー率・スループット
    - データベースクエリ性能
    - キャッシュヒット率
    - ビジネスメトリクス

インフラストラクチャダッシュボード:
  目的: インフラリソース監視

  パネル構成:
    - CPU・メモリ・ディスク使用率
    - ネットワークI/O
    - コンテナ状態・リソース使用
    - データベース接続・性能
    - キャッシュ状態

ビジネスダッシュボード:
  目的: ビジネス価値・KPI監視

  パネル構成:
    - ユーザー成長・継続率
    - 検索・コンテンツ利用状況
    - コンバージョン率
    - 機能採用率
    - 収益関連指標（将来拡張）
```

### アラート設定

#### **アラートルール定義**

**重大度別アラート**:

```yaml
Critical (重大):
  条件: サービス停止・重大パフォーマンス劣化
  通知: 即座（Slack + PagerDuty + メール）

  ルール例:
    - API可用性 < 95% (5分間)
    - エラー率 > 5% (5分間)
    - レスポンス時間 95%ile > 2秒 (10分間)
    - データベース接続失敗率 > 10% (2分間)

Warning (警告):
  条件: 性能劣化・リソース不足の兆候
  通知: 15分以内（Slack + メール）

  ルール例:
    - CPU使用率 > 80% (15分間)
    - メモリ使用率 > 85% (10分間)
    - ディスク使用率 > 85% (30分間)
    - キャッシュヒット率 < 80% (30分間)

Info (情報):
  条件: 監視値の変化・注意が必要な状況
  通知: 1時間以内（Slack のみ）

  ルール例:
    - デプロイ完了通知
    - ユーザー登録数急増
    - 新機能利用開始
    - 定期メンテナンス完了
```

**Prometheus Alert Rules**:

```yaml
# alert_rules.yml
groups:
  - name: service_availability
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.service }}"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time on {{ $labels.service }}"
          description: "95th percentile response time is {{ $value }}s on {{ $labels.service }}"

  - name: infrastructure
    rules:
      - alert: HighCpuUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"

  - name: database
    rules:
      - alert: DatabaseConnectionFailure
        expr: rate(postgresql_connection_errors_total[5m]) / rate(postgresql_connections_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High database connection failure rate"
          description: "Database connection failure rate is {{ $value | humanizePercentage }}"

      - alert: SlowQueries
        expr: postgresql_slow_queries_total > 10
        for: 60m
        labels:
          severity: warning
        annotations:
          summary: "High number of slow queries"
          description: "{{ $value }} slow queries detected in the last hour"
```

#### **通知設定**

**Alertmanager設定**:

```yaml
# alertmanager.yml
global:
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#cinecom-alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical-alerts'
    slack_configs:
      - channel: '#cinecom-critical'
        title: '🚨 Critical Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        color: 'danger'
    email_configs:
      - to: 'oncall@cinecom.com'
        subject: 'Critical Alert: {{ .GroupLabels.alertname }}'
        body: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'warning-alerts'
    slack_configs:
      - channel: '#cinecom-warnings'
        title: '⚠️ Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        color: 'warning'
```

### ログ管理

#### **構造化ログ**

**ログフォーマット標準**:

```yaml
標準フィールド:
  timestamp: ISO 8601形式
  level: DEBUG/INFO/WARN/ERROR/FATAL
  service: サービス名
  version: アプリケーションバージョン
  request_id: リクエスト追跡ID
  user_id: ユーザーID（該当時）
  message: ログメッセージ
  context: 追加コンテキスト情報

例（JSON形式）:
{
  "timestamp": "2025-08-22T14:30:00.123Z",
  "level": "ERROR",
  "service": "movie-service",
  "version": "1.2.3",
  "request_id": "req-abc123",
  "user_id": "user-456",
  "message": "Database query failed",
  "context": {
    "query": "SELECT * FROM movies WHERE id = $1",
    "error": "connection timeout",
    "duration_ms": 5000
  }
}
```

**Winston設定例**:

```typescript
// logger.config.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    version: process.env.SERVICE_VERSION,
  },
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new transports.File({
      filename: 'logs/combined.log'
    }),
  ],
});

// 本番環境ではSentryにエラーを送信
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.Http({
    host: 'logs.cinecom.com',
    port: 443,
    path: '/api/logs',
  }));
}

export default logger;
```

#### **ログ集約・分析**

**ELK Stack設定**（将来拡張）:

```yaml
Elasticsearch:
  目的: ログデータ保存・検索
  設定:
    - インデックス: cinecom-logs-YYYY.MM.DD
    - 保持期間: 30日間
    - レプリカ: 1
    - シャード: 1（小規模構成）

Logstash:
  目的: ログ変換・前処理
  設定:
    - 入力: Filebeat from services
    - フィルター: JSON解析・フィールド正規化
    - 出力: Elasticsearch + アラート

Kibana:
  目的: ログ可視化・分析
  ダッシュボード:
    - エラーログ分析
    - リクエストフロー追跡
    - パフォーマンス分析
    - セキュリティイベント
```

### 分散トレーシング

#### **トレーシング実装**

**OpenTelemetry設定**:

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
});

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: process.env.SERVICE_NAME,
  serviceVersion: process.env.SERVICE_VERSION,
});

sdk.start();

// カスタムスパン作成例
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('movie-service');

export async function searchMovies(query: string) {
  const span = tracer.startSpan('movie.search');

  try {
    span.setAttributes({
      'movie.search.query': query,
      'movie.search.type': 'fulltext',
    });

    const results = await performSearch(query);

    span.setAttributes({
      'movie.search.results.count': results.length,
    });

    return results;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```

### パフォーマンス監視

#### **SLA監視**

**Service Level Indicators (SLI)**:

```yaml
可用性SLI:
  定義: HTTP 200-499 レスポンス / 全HTTPレスポンス
  測定: Prometheus counter メトリクス
  目標値: 99.9%

レスポンス時間SLI:
  定義: 95%ile レスポンス時間（段階的目標）
  測定: Prometheus histogram メトリクス
  Phase 1目標: 500ms以下（MVP）
  Phase 2目標: 300ms以下（最適化）
  Phase 3目標: 200ms以下（最終）

エラー率SLI:
  定義: HTTP 5xx エラー / 全HTTPリクエスト
  測定: Prometheus counter メトリクス
  目標値: 0.1%以下
```

**Error Budget計算**:

```yaml
可用性Error Budget:
  目標: 99.9% (月間43分のダウンタイム許容)
  計算: (1 - 0.999) * 30日 * 24時間 * 60分 = 43.2分
  監視: 月初にリセット、消費率を追跡

レスポンス時間Error Budget:
  目標: 95%のリクエストが500ms以下
  計算: 5%のリクエストが500ms超過許容
  監視: 1日単位で追跡、超過時アラート
```

### 関連ドキュメント

- **品質基準**: `/docs/operations/quality_standards.md` - 品質目標・基準詳細
- **アラート対応**: `/docs/operations/incident_response.md` - インシデント対応手順
- **CI/CD監視**: `/docs/development/ci_cd_pipeline.md` - パイプライン監視
- **セキュリティ監視**: `/docs/security/monitoring.md` - セキュリティイベント監視

### 更新履歴

- **v1.0** (2025-08-22): 初版作成 - 基本監視戦略・メトリクス定義
- **次回更新予定**: Phase 1完了時（Week 2終了時）- 実装結果による調整

---

**重要**: 監視は「観測→分析→改善」のサイクルです。メトリクスを収集するだけでなく、データから洞察を得て継続的改善に活用してください。
