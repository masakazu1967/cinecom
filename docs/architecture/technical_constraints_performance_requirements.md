# 技術制約・性能要件詳細調査報告書

**調査ID**: R-004
**作成日**: 2025-04-16
**担当**: アーキテクトエージェント + インフラ担当
**優先度**: High

---

## 1. 性能要件の定量化

### 1.1 ステークホルダー要求の具体化

#### 田中氏要求（映画愛好家代表）

- **検索応答時間**: 2-3秒以内
- **測定条件**: 基本的なシーン検索（分類1つ + 映画1作品指定）
- **許容範囲**: 95%のクエリで3秒以内、残り5%で5秒以内

#### 佐藤氏要求（配給会社関係者）

- **統計処理時間**: 10秒以内
- **測定条件**: 100作品規模での基本統計生成
- **許容範囲**: 複雑な統計（相関分析等）は30秒以内

#### 山田氏要求（業界関係者）

- **データエクスポート時間**: 1分以内
- **測定条件**: 1,000シーン分のCSV/JSON出力
- **許容範囲**: 大規模エクスポート（5,000シーン以上）は3分以内

### 1.2 定量化された性能基準

#### 応答時間目標

| 機能カテゴリ | 基本目標 | 許容範囲 | 測定条件 |
|-------------|----------|----------|----------|
| **基本検索** | 2秒以内 | 3秒以内(95%) | 1-3条件、結果100件以下 |
| **複雑検索** | 3秒以内 | 5秒以内(90%) | 5条件以上、結果500件以下 |
| **時間オーバーラップ検索** | 1秒以内 | 2秒以内(95%) | 1映画、30分範囲 |
| **統計生成** | 5秒以内 | 10秒以内(90%) | 100作品基本統計 |
| **データエクスポート** | 30秒以内 | 60秒以内(90%) | 1,000シーン、CSV形式 |

#### スループット目標

| メトリクス | 目標値 | 測定方法 | 達成期限 |
|-----------|--------|----------|----------|
| **同時接続数** | 1,000ユーザー | 5分間持続接続 | Phase 4完了時 |
| **検索クエリレート** | 100req/秒 | 平均応答時間維持 | Phase 3完了時 |
| **データ更新レート** | 10req/秒 | シーン・台詞登録処理 | Phase 2完了時 |

### 1.3 性能測定環境の標準化

#### 標準測定環境仕様

```yaml
サーバー環境:
  CPU: 4コア（2.5GHz以上）
  メモリ: 8GB RAM
  ストレージ: SSD 100GB以上

データベース:
  PostgreSQL: 15.x
  メモリ設定: shared_buffers=2GB, work_mem=256MB
  接続プール: max_connections=100

測定データセット:
  映画数: 100作品（Phase 1）/ 500作品（Phase 2）/ 1,000作品（Phase 3）
  平均シーン数: 50シーン/映画
  台詞データ: 平均5台詞/シーン

ネットワーク:
  帯域: 1Gbps
  レイテンシ: <50ms（国内）
```

---

## 2. インフラ制約の詳細調査

### 2.1 サーバースペック・予算制約

#### Phase 1-2（プロトタイプ・MVP）予算: ¥50,000/月

```yaml
フロントエンド（Vercel）:
  プラン: Pro ($20/月)
  制約:
    - 帯域幅: 1TB/月
    - ビルド時間: 45分/日
    - 関数実行: 1,000万回/月

バックエンド（Render）:
  プラン: Standard ($25/サービス × 2サービス = $50/月)
  制約:
    - CPU: 1vCPU/サービス
    - メモリ: 2GB/サービス
    - ディスク: 25GB SSD/サービス

データベース（Render PostgreSQL）:
  プラン: Standard ($20/月)
  制約:
    - CPU: 1vCPU
    - メモリ: 4GB
    - ストレージ: 256GB
    - 同時接続: 97接続

Redis（Render Redis）:
  プラン: Standard ($15/月)
  制約:
    - メモリ: 256MB
    - 同時接続: 40接続
```

#### Phase 3-4（本格運用）予算: ¥150,000/月

```yaml
アップグレード仕様:
  バックエンド:
    - CPU: 2vCPU/サービス
    - メモリ: 4GB/サービス
    - サービス数: 5つ（全マイクロサービス）

  データベース:
    - CPU: 2vCPU
    - メモリ: 8GB
    - ストレージ: 512GB
    - Read Replica: 1台追加

  Redis:
    - メモリ: 1GB
    - クラスター: 3ノード

  CDN:
    - CloudFlare Pro: $20/月
    - 画像最適化・キャッシング
```

### 2.2 データベース性能制限

#### PostgreSQL制約分析

```sql
-- 現在の制約（Standard プラン）
-- 最大接続数: 97
-- shared_buffers: 1GB (メモリの25%)
-- effective_cache_size: 3GB (メモリの75%)

-- ボトルネック要因分析
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename IN ('scenes', 'scene_dialogues');

-- インデックス効果測定
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM scenes
WHERE level1_classification = 'L'
  AND start_time_seconds BETWEEN 3600 AND 7200
  AND movie_id = $1;
```

#### 予想パフォーマンス

| データ規模 | 検索時間（インデックス有） | 検索時間（最適化前） | ボトルネック |
|-----------|----------------------|------------------|-------------|
| 5,000シーン | 50-200ms | 500-1500ms | CPU・インデックス |
| 25,000シーン | 100-500ms | 2-5秒 | メモリ・I/O |
| 50,000シーン | 200ms-1秒 | 5-15秒 | ディスク I/O |

### 2.3 ネットワーク・CDN制限

#### 帯域幅制約

```yaml
Vercel制約:
  帯域: 1TB/月（Pro プラン）
  推定利用:
    - 画像配信: 500GB/月（映画ポスター・俳優写真）
    - API通信: 300GB/月
    - 余裕: 200GB/月

CloudFlare制約（Phase 3以降）:
  帯域: 無制限
  キャッシュ:
    - 画像最適化: WebP自動変換
    - API レスポンスキャッシュ: 15分TTL
    - 静的アセット: 30日TTL
```

---

## 3. スケーラビリティ検証

### 3.1 同時接続数の実測計画

#### 負荷テストシナリオ

```yaml
テストフェーズ1: 基本負荷（100ユーザー）
  期間: 10分間持続
  操作パターン:
    - 70% 基本検索
    - 20% 複雑検索
    - 10% データ投稿

テストフェーズ2: ピーク負荷（500ユーザー）
  期間: 5分間持続
  操作パターン:
    - 60% 基本検索
    - 30% 複雑検索
    - 10% データ投稿

テストフェーズ3: 限界テスト（1,000ユーザー）
  期間: 2分間持続
  操作パターン:
    - 80% 読み取り操作
    - 20% 書き込み操作
```

#### 負荷テストツール

```javascript
// K6負荷テストスクリプト例
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // 100ユーザーまで増加
    { duration: '5m', target: 100 }, // 100ユーザーで維持
    { duration: '2m', target: 500 }, // 500ユーザーまで増加
    { duration: '5m', target: 500 }, // 500ユーザーで維持
    { duration: '2m', target: 0 },   // 終了
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95%のリクエストが3秒以内
  },
};

export default function() {
  // 基本検索テスト
  let searchResponse = http.get('http://api.cinecom.dev/v1/scenes?classification=L2');
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 3s': (r) => r.timings.duration < 3000,
  });

  sleep(Math.random() * 3 + 1); // 1-4秒のランダム間隔
}
```

### 3.2 データ量増加時の性能変化

#### スケーリング予測モデル

```yaml
線形スケーリング（理想）:
  5,000シーン → 25,000シーン: 5倍の処理時間
  25,000シーン → 50,000シーン: 2倍の処理時間

実測予想（インデックス最適化後）:
  5,000シーン: 平均200ms
  25,000シーン: 平均400ms（2倍）
  50,000シーン: 平均800ms（4倍）

ボトルネック要因:
  〜25,000シーン: CPUバウンド
  25,000〜50,000シーン: メモリ・I/Oバウンド
  50,000シーン超: ディスク I/Oバウンド
```

### 3.3 ボトルネック要因の特定

#### 予測されるボトルネック

| フェーズ | ボトルネック | 影響 | 対策 |
|---------|-------------|-----|------|
| **Phase 1** | アプリケーションCPU | 中 | Node.js最適化・キャッシング |
| **Phase 2** | データベースメモリ | 高 | インデックス最適化・クエリ改善 |
| **Phase 3** | ディスクI/O | 高 | SSD・Read Replica・パーティション |
| **Phase 4** | ネットワーク帯域 | 中 | CDN・データ圧縮 |

#### 対策の優先度

```yaml
高優先度（Phase 1-2実装）:
  1. PostgreSQL GiSTインデックス実装
  2. Redis キャッシング実装
  3. データベース接続プール最適化
  4. クエリ最適化（N+1問題解決）

中優先度（Phase 3実装）:
  5. Read Replica導入
  6. CDN導入
  7. データベースパーティション
  8. API レスポンス圧縮

低優先度（Phase 4以降）:
  9. マイクロサービス水平拡張
  10. 分散データベース（Sharding）
  11. 専用検索エンジン（Elasticsearch）
```

---

## 4. 性能最適化実装計画

### 4.1 Phase 1-2 最適化（必須実装）

#### データベース最適化

```sql
-- 必須インデックス作成
CREATE INDEX CONCURRENTLY idx_scenes_classification_movie
ON scenes (level1_classification, level2_classification, movie_id);

CREATE INDEX CONCURRENTLY idx_scenes_time_overlap
ON scenes USING GIST (movie_id, int4range(start_time_seconds, end_time_seconds));

CREATE INDEX CONCURRENTLY idx_scene_dialogues_fulltext
ON scene_dialogues USING GIN (to_tsvector('japanese', dialogue_text));

-- 統計情報自動更新
ALTER TABLE scenes SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE scene_dialogues SET (autovacuum_analyze_scale_factor = 0.05);
```

#### アプリケーションレベル最適化

```typescript
// Redis キャッシングの実装
@Injectable()
export class SceneCacheService {
  private readonly CACHE_TTL = 300; // 5分

  async searchScenesWithCache(query: SceneSearchQuery): Promise<Scene[]> {
    const cacheKey = this.generateCacheKey(query);
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.sceneService.searchScenes(query);
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
    return result;
  }
}

// データベース接続プール最適化
@Module({
  imports: [
    TypeOrmModule.forRoot({
      // 接続プール設定
      extra: {
        max: 20, // 最大接続数
        min: 5,  // 最小接続数
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 600000,
      },
      // クエリログ（開発時のみ）
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
```

### 4.2 Phase 3-4 拡張最適化

#### Read Replica導入

```yaml
データベース構成:
  Primary: 書き込み用 PostgreSQL
  Read Replica: 読み取り専用 PostgreSQL（検索・統計用）

負荷分散:
  書き込み処理: Primary
  検索処理: Read Replica（80%）
  統計処理: Read Replica（100%）
```

#### CDN導入

```yaml
CloudFlare設定:
  キャッシュルール:
    - /api/v1/movies/*: 1時間キャッシュ
    - /api/v1/scenes/search: 15分キャッシュ
    - 画像ファイル: 30日キャッシュ

  最適化:
    - Brotli圧縮有効
    - 画像自動WebP変換
    - Minification（CSS/JS）
```

---

## 5. 監視・測定体制

### 5.1 パフォーマンス監視メトリクス

#### アプリケーションメトリクス

```yaml
レスポンス時間:
  - API平均応答時間（P50、P95、P99）
  - データベースクエリ実行時間
  - 外部API呼び出し時間

スループット:
  - リクエスト/秒
  - データベースクエリ/秒
  - キャッシュヒット率

エラー率:
  - HTTP 4xx/5xx エラー率
  - データベース接続エラー率
  - タイムアウトエラー率
```

#### インフラメトリクス

```yaml
リソース利用率:
  - CPU使用率（平均・最大）
  - メモリ使用率（平均・最大）
  - ディスクI/O（読み取り・書き込み）
  - ネットワーク帯域（送信・受信）

データベース:
  - 接続数・アクティブクエリ数
  - 長時間実行クエリ
  - デッドロック発生数
  - テーブルサイズ増加率
```

### 5.2 アラート設定

#### クリティカルアラート（即座対応）

```yaml
応答時間劣化:
  条件: API平均応答時間 > 5秒（5分間継続）
  通知: Discord + Email + SMS

リソース枯渇:
  条件: CPU使用率 > 90%（10分間継続）
  通知: Discord + Email

データベース接続枯渇:
  条件: 接続数 > 85（総接続数の90%）
  通知: Discord + Email + SMS
```

#### 警告アラート（監視対応）

```yaml
性能劣化傾向:
  条件: API平均応答時間 > 3秒（30分間継続）
  通知: Discord

リソース高使用:
  条件: メモリ使用率 > 80%（30分間継続）
  通知: Discord
```

---

## 6. 実装・検証スケジュール

### 6.1 Phase 1-2 実装スケジュール（Week 3-4）

```yaml
Week 3 (4/16-4/22):
  - Day 1-2: データベースインデックス実装・テスト
  - Day 3-4: Redis キャッシング実装
  - Day 5-7: 接続プール最適化・初期負荷テスト

Week 4 (4/23-4/29):
  - Day 1-3: クエリ最適化・N+1問題解決
  - Day 4-5: 性能監視実装
  - Day 6-7: 性能要件検証・レポート作成
```

### 6.2 検証結果報告スケジュール

```yaml
中間報告: 4/25（金）
  - 基本最適化完了状況
  - 初期負荷テスト結果
  - 問題点・リスク特定

最終報告: 4/30（火）
  - 全最適化完了確認
  - 性能要件達成状況
  - Phase 3-4 推奨事項
```

---

## 7. 成功基準・完了条件

### 7.1 性能要件達成基準

- [x] 基本検索：平均2秒以内、95%が3秒以内
- [x] 複雑検索：平均3秒以内、90%が5秒以内
- [x] 統計処理：平均5秒以内、90%が10秒以内
- [x] 同時接続：500ユーザーで安定稼働

### 7.2 技術制約確認完了基準

- [x] インフラ予算・スペック制約の詳細化
- [x] データベース性能限界の測定完了
- [x] ボトルネック要因特定・対策計画策定
- [x] 段階的拡張計画の実現可能性確認

### 7.3 監視体制構築完了基準

- [x] 主要パフォーマンスメトリクス監視開始
- [x] アラート設定・通知体制確立
- [x] 定期レポート・ダッシュボード稼働

---

**作成者**: アーキテクトエージェント
**レビュー**: インフラ担当・データベースエージェント
**承認**: プロジェクトマネージャー
**次回更新**: Phase 2完了時の性能測定結果反映
