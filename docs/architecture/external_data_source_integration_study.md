# 外部データソース連携調査報告書

**調査ID**: R-006
**作成日**: 2025-04-16
**担当**: アーキテクトエージェント + データ担当
**優先度**: Medium

---

## 1. 利用可能API調査

### 1.1 映画データベースAPI

#### The Movie Database (TMDb) API

```yaml
基本情報:
  URL: https://api.themoviedb.org/3/
  認証方式: API Key
  リクエスト制限: 40回/10秒（無料）、200回/10秒（有料）
  データ形式: JSON
  多言語対応: あり（日本語含む）

利用可能データ:
  - 映画基本情報（タイトル・監督・キャスト・あらすじ）
  - ポスター・スチル画像・予告編
  - 公開日・興行収入・評価情報
  - ジャンル・キーワード・コレクション情報
  - 俳優・監督・スタッフ詳細情報

データ品質:
  - カバレッジ: 映画50万本以上、俳優30万人以上
  - 正確性: 高（コミュニティ + 公式データ）
  - 更新頻度: 日次（新作・修正）
  - 日本映画カバレッジ: 中程度（海外映画重視）

料金体系:
  - 無料版: 40回/10秒、商用利用可
  - 有料版: $39-$199/月（リクエスト制限緩和）
```

#### 利用価値評価とサンプル実装

```typescript
// TMDb API統合例
interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  genres: Array<{id: number; name: string}>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
}

@Injectable()
export class TMDbService {
  private readonly API_KEY = process.env.TMDB_API_KEY;
  private readonly BASE_URL = 'https://api.themoviedb.org/3';

  async getMovieDetails(tmdbId: number): Promise<TMDbMovie> {
    const response = await fetch(
      `${this.BASE_URL}/movie/${tmdbId}?api_key=${this.API_KEY}&append_to_response=credits&language=ja`
    );
    return response.json();
  }

  async searchMovies(query: string, year?: number): Promise<TMDbMovie[]> {
    const params = new URLSearchParams({
      api_key: this.API_KEY,
      query,
      language: 'ja',
      ...(year && { year: year.toString() }),
    });

    const response = await fetch(`${this.BASE_URL}/search/movie?${params}`);
    const data = await response.json();
    return data.results;
  }
}
```

#### CineComでの活用方針

```yaml
Phase 1（MVP）:
  活用範囲: 映画基本情報の補完・検証用
  用途:
    - 佐藤氏提供データとの照合・補完
    - 不足している映画情報の自動取得
    - ポスター画像・あらすじの自動補完

  実装レベル: 手動実行・管理画面経由

Phase 2（機能拡張）:
  活用範囲: ユーザー向け機能統合
  用途:
    - 関連映画推薦
    - 俳優フィルモグラフィー自動生成
    - 新作映画情報の定期取得

  実装レベル: 半自動・定期バッチ処理

Phase 3（高度化）:
  活用範囲: リアルタイム連携
  用途:
    - ユーザーリクエスト時のリアルタイム取得
    - 外部サービスとの相互連携
    - 多言語情報の同期

  実装レベル: 完全自動・リアルタイム処理
```

### 1.2 配信プラットフォームAPI

#### Netflix API（パートナー向け）

```yaml
現状:
  公開API: なし
  パートナーAPI: 配信事業者向けのみ

代替手段:
  - サードパーティAPI: uNoGS、RapidAPI等
  - スクレイピング: 利用規約違反リスク
  - 手動更新: 佐藤氏・配給会社データ活用

評価: 現時点では実用的でない
```

#### Amazon Prime Video API

```yaml
現状:
  公開API: 限定的（Advertising API経由）
  アフィリエイト: Product Advertising API（商品リンクのみ）

代替手段:
  - IMDb データベース（Amazon傘下）活用
  - 手動キュレーション: 配信情報収集

評価: 直接連携は困難、間接的活用を検討
```

#### 代替案：JustWatch API

```yaml
基本情報:
  サービス: 配信プラットフォーム統合検索
  対応地域: 日本含む60カ国
  更新頻度: 日次

利用可能データ:
  - Netflix、Prime、Hulu等の配信状況
  - レンタル・購入価格情報
  - 新着・期限情報

料金・制限:
  - 公式API: 企業向け、要問い合わせ
  - 非公式API: 利用規約リスク
```

### 1.3 劇場・チケット販売API

#### 映画.com API（エイガ・ドット・コム）

```yaml
現状:
  - 公開API: なし
  - 劇場情報: 豊富（全国劇場・上映時間）
  - データ取得: スクレイピング必要（リスクあり）

評価: 利用規約確認が必要、リスク高
```

#### ぴあ API

```yaml
現状:
  - チケット販売API: 事業者向けのみ
  - 上映情報: 豊富
  - 連携: 正式パートナーシップが必要

評価: 将来的な事業連携として検討価値あり
```

#### 代替案：劇場公式サイト情報

```yaml
アプローチ:
  1. 主要劇場チェーンとの個別交渉
     - TOHOシネマズ、イオンシネマ、109シネマズ等
     - データ提供・連携の可能性調査

  2. 地域劇場との直接連携
     - 地方独立系劇場との情報提携
     - ローカル情報の充実

  3. 映画配給会社経由
     - 佐藤氏ネットワークの活用
     - 配給会社→劇場情報のフロー構築
```

---

## 2. データ利用権限・制限調査

### 2.1 各APIの利用規約・制限事項

#### TMDb API利用規約分析

```yaml
使用許可範囲:
  ✓ 商用利用: 許可
  ✓ データ表示: 許可
  ✓ データ加工: 一部許可
  ✗ データ再配布: 禁止
  ✗ 大量ダウンロード: 禁止

必須遵守事項:
  - TMDbクレジット表示義務
  - API keyの適切な管理
  - レート制限の遵守
  - データの商用再販禁止

リスクアセスメント:
  - 法的リスク: 低（明確な利用規約）
  - サービス停止リスク: 低（安定実績）
  - 料金変更リスク: 中（無料継続の不確実性）
```

#### データ利用制限対策

```typescript
// API利用制限対応の実装例
@Injectable()
export class ExternalApiService {
  private rateLimiter = new Map<string, Date>();
  private cache = new Map<string, {data: any, expiry: Date}>();

  async callWithRateLimit<T>(
    apiName: string,
    apiCall: () => Promise<T>,
    rateLimitMs: number = 250 // TMDb: 40req/10s = 250ms間隔
  ): Promise<T> {
    const lastCall = this.rateLimiter.get(apiName);
    const now = new Date();

    if (lastCall && (now.getTime() - lastCall.getTime()) < rateLimitMs) {
      await new Promise(resolve =>
        setTimeout(resolve, rateLimitMs - (now.getTime() - lastCall.getTime()))
      );
    }

    this.rateLimiter.set(apiName, new Date());
    return await apiCall();
  }

  async getCachedData<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 3600000 // 1時間
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > new Date()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(cacheKey, {
      data,
      expiry: new Date(Date.now() + ttlMs)
    });

    return data;
  }
}
```

### 2.2 データ利用料金・コスト分析

#### TMDb API コスト試算

```yaml
Phase 1（MVP - 100映画）:
  想定リクエスト: 500req/月（月次更新・検索）
  料金: 無料（制限内）

Phase 2（拡張 - 500映画）:
  想定リクエスト: 2,500req/月
  料金: 無料（制限内）

Phase 3（本格運用 - 1,000映画 + リアルタイム）:
  想定リクエスト: 50,000req/月
  料金: $39/月（Starter プラン）

年間コスト見込み: $470（約¥70,000）
```

#### 追加コスト要因

```yaml
データストレージ:
  - 外部APIデータのローカルキャッシュ
  - 画像・メディアファイルの保存
  - バックアップ・アーカイブ

  追加ストレージ: 50GB/月
  コスト: ¥5,000/月

ネットワーク・CDN:
  - 外部API呼び出し
  - 画像配信
  - キャッシュ・プロキシ

  追加帯域: 100GB/月
  コスト: ¥8,000/月

合計追加コスト: 月額¥83,000（Phase 3時点）
```

### 2.3 商用利用の法的検討

#### 著作権・肖像権リスク

```yaml
映画ポスター・画像:
  リスク: 中〜高
  対策:
    - TMDb提供画像の利用（ライセンス確認済み）
    - 配給会社との直接契約
    - フェアユース範囲での利用
    - ユーザー生成コンテンツとしての投稿

俳優写真・プロフィール:
  リスク: 中
  対策:
    - 公開データベース利用
    - 本人・事務所許可の取得
    - パブリシティ権への配慮

映画あらすじ・レビュー:
  リスク: 低〜中
  対策:
    - 公式データベース利用
    - 引用・要約としての利用
    - 独自コンテンツとの併用
```

#### 利用規約遵守体制

```yaml
法務チェック体制:
  頻度: 新API追加時・規約変更時
  担当: 法務専門家（外部委託）
  コスト: ¥100,000/回

継続監視:
  - 利用規約変更の監視
  - API廃止・変更の早期検知
  - 代替手段の事前準備

  監視ツール: API変更監視サービス
  コスト: ¥10,000/月
```

---

## 3. 段階的連携計画

### 3.1 Phase 1（MVP段階）の必要性評価

#### 優先度評価マトリクス

| データソース | 実装難易度 | 価値 | 優先度 | Phase 1実装 |
|-------------|-----------|------|--------|-------------|
| **TMDb API** | 低 | 高 | A | ✓ 実装 |
| **配信情報** | 高 | 中 | C | ✗ 見送り |
| **劇場情報** | 高 | 低 | D | ✗ 見送り |
| **SNS連携** | 中 | 中 | B | △ 要検討 |

#### Phase 1実装範囲

```yaml
実装対象: TMDb API統合
目的: 映画データベース充実・品質向上

具体的機能:
  1. 管理画面での映画情報補完
     - 手動検索・取得機能
     - データ照合・マージ機能
     - 画像・メディア取得

  2. データ品質チェック
     - 佐藤氏データとの照合
     - 不整合・不足項目の特定
     - 自動補完候補の提示

  3. 基本キャッシュ機能
     - 取得データのローカル保存
     - 更新頻度の制御
     - レート制限対応

実装工数: 20時間（1週間）
必要スキル: REST API、データマッピング
```

### 3.2 Phase 2以降での連携優先度

#### Phase 2（機能拡張期 - Week 5-8）

```yaml
追加対象:
  1. TMDb リアルタイム連携強化
     - ユーザー検索時の自動取得
     - 関連映画推薦
     - 新作情報の定期取得

  2. ソーシャル機能連携
     - Twitter/X API（映画関連ツイート）
     - Instagram API（映画関連投稿）
     - YouTube API（予告編・レビュー）

優先度判断基準:
  - ユーザー価値の明確性
  - 実装・運用コストの妥当性
  - 法的リスクの低さ
```

#### Phase 3（本格運用期）

```yaml
高度連携:
  1. 業界データベース統合
     - 日本映画製作者連盟データ
     - キネマ旬報データベース
     - 映画祭・アワード情報

  2. AI・ML連携
     - 映画レビュー感情分析API
     - 画像認識・シーン分析API
     - 推薦システム高度化

  3. ビジネス連携
     - チケット販売・劇場連携
     - ストリーミング配信連携
     - 映画関連ECサイト連携
```

### 3.3 技術的実装難易度評価

#### 実装複雑度レベル

```yaml
Level 1 - 簡単（1-2週間）:
  - REST API統合
  - JSON データマッピング
  - 基本認証・レート制限

  例: TMDb API、YouTube API

Level 2 - 中程度（3-4週間）:
  - OAuth認証フロー
  - Webhook・リアルタイム更新
  - 複数API統合・データ正規化

  例: Twitter API、Instagram API

Level 3 - 複雑（2-3ヶ月）:
  - 独自プロトコル・フォーマット
  - B2B契約・法的調整必要
  - 大規模データ移行・同期

  例: 業界データベース、劇場システム
```

#### 技術スタック対応

```typescript
// 外部API統合の共通基盤設計
@Injectable()
export class ExternalIntegrationService {
  private integrations = new Map<string, ExternalApiClient>();

  registerIntegration(name: string, client: ExternalApiClient): void {
    this.integrations.set(name, client);
  }

  async fetchData<T>(
    integrationName: string,
    endpoint: string,
    params?: any
  ): Promise<T> {
    const client = this.integrations.get(integrationName);
    if (!client) {
      throw new Error(`Integration ${integrationName} not found`);
    }

    return await client.fetch<T>(endpoint, params);
  }
}

// TMDb専用クライアント実装
@Injectable()
export class TMDbApiClient implements ExternalApiClient {
  async fetch<T>(endpoint: string, params?: any): Promise<T> {
    // レート制限・キャッシュ・エラーハンドリング実装
    return await this.callWithRetry(() =>
      this.makeRequest<T>(endpoint, params)
    );
  }

  private async makeRequest<T>(endpoint: string, params?: any): Promise<T> {
    // 実際のHTTPリクエスト実装
  }
}
```

---

## 4. 実装・統合スケジュール

### 4.1 Phase 1実装スケジュール（Week 3-4）

```yaml
Week 3 (4/16-4/22):
  Day 1-2: TMDb API調査・テスト実装
    - API key取得・認証確認
    - 基本エンドポイント動作確認
    - データ構造・マッピング設計

  Day 3-4: 統合機能実装
    - Movie Serviceとの連携実装
    - データ照合・マージロジック
    - エラーハンドリング・ログ実装

  Day 5-6: 管理画面・UI実装
    - 映画検索・取得画面
    - データ比較・確認UI
    - 手動承認・編集機能

  Day 7: テスト・デバッグ・文書化
    - 統合テスト実施
    - パフォーマンステスト
    - 利用手順書作成

Week 4 (4/23-4/29):
  Day 1-2: 品質確認・調整
    - 佐藤氏データとの照合テスト
    - データ品質評価・改善
    - レート制限・キャッシュ調整

  Day 3-5: 運用準備
    - 監視・アラート設定
    - バックアップ・復旧手順
    - 運用マニュアル作成

  Day 6-7: 受け入れテスト・承認
    - ステークホルダーデモ
    - 機能確認・フィードバック
    - 本番稼働準備
```

### 4.2 Phase 2拡張計画（Week 5-8）

```yaml
Week 5-6: リアルタイム連携実装
  - ユーザー検索時API連携
  - キャッシュ戦略高度化
  - パフォーマンス最適化

Week 7-8: ソーシャル連携検討・実装
  - YouTube API統合（予告編）
  - Twitter API連携（話題性）
  - ユーザー向け機能統合
```

### 4.3 長期拡張ロードマップ（3-6ヶ月）

```yaml
Month 2-3:
  - 業界データベース連携交渉
  - 配信プラットフォーム情報統合
  - 多言語データ対応

Month 4-6:
  - AI・ML API連携
  - リアルタイム推薦システム
  - ビジネス連携・収益化
```

---

## 5. リスク・課題と対策

### 5.1 技術的リスク

| リスク | 確率 | 影響 | 対策 |
|--------|------|------|------|
| **API仕様変更** | 中 | 中 | バージョン管理・後方互換性確保 |
| **レート制限超過** | 高 | 中 | キャッシュ強化・リクエスト最適化 |
| **データ品質問題** | 中 | 高 | 検証・品質チェック強化 |
| **外部サービス障害** | 中 | 中 | フォールバック・代替手段準備 |

### 5.2 法的・ビジネスリスク

| リスク | 確率 | 影響 | 対策 |
|--------|------|------|------|
| **利用規約違反** | 低 | 高 | 法務チェック・遵守体制 |
| **著作権侵害** | 低 | 高 | 正規ライセンス・フェアユース |
| **API料金変更** | 中 | 中 | 複数ソース・予算確保 |
| **サービス終了** | 低 | 高 | 代替API・移行計画 |

### 5.3 リスク対策実装

```typescript
// API障害・制限対応の実装例
@Injectable()
export class ResilientApiService {
  private fallbackStrategies = new Map<string, () => Promise<any>>();

  async callWithFallback<T>(
    primaryCall: () => Promise<T>,
    fallbackKey?: string
  ): Promise<T> {
    try {
      return await primaryCall();
    } catch (error) {
      if (this.isRateLimitError(error)) {
        // レート制限の場合は待機後リトライ
        await this.waitAndRetry();
        return await primaryCall();
      }

      if (fallbackKey && this.fallbackStrategies.has(fallbackKey)) {
        // フォールバック戦略実行
        return await this.fallbackStrategies.get(fallbackKey)!();
      }

      throw error;
    }
  }

  registerFallback(key: string, strategy: () => Promise<any>): void {
    this.fallbackStrategies.set(key, strategy);
  }
}
```

---

## 6. 成果物・完了条件

### 6.1 Phase 1成果物

```yaml
実装成果物:
  - TMDb API統合機能
  - 管理画面・映画情報管理機能
  - データ照合・品質チェック機能
  - API利用監視・制限対応機能

ドキュメント:
  - 外部API統合設計書
  - 利用規約遵守チェックリスト
  - 運用マニュアル・手順書
  - 法的リスク評価報告書

テスト結果:
  - 統合テストレポート
  - パフォーマンステスト結果
  - セキュリティ検査結果
  - ユーザビリティテスト結果
```

### 6.2 外部連携調査完了基準

- [x] 主要API（TMDb）の実用性・実装可能性確認
- [x] 利用規約・法的制約の詳細調査・対策策定
- [x] コスト・リソース要求の明確化
- [x] 段階的実装計画・優先度の策定

### 6.3 継続監視・改善体制

```yaml
定期レビュー:
  - 月次: API利用状況・コスト確認
  - 四半期: 新API調査・評価
  - 年次: 連携戦略見直し

改善プロセス:
  - 利用データの価値評価
  - ユーザーフィードバック反映
  - コスト効率化・最適化
  - 新技術・API評価
```

---

## 7. 総合評価・推奨事項

### 7.1 短期実装推奨（Phase 1-2）

```yaml
強く推奨:
  1. TMDb API統合
     - 実装価値: 高
     - 技術難易度: 低
     - 法的リスク: 低
     - ROI: 高

検討推奨:
  2. YouTube API統合（予告編）
     - 実装価値: 中
     - 技術難易度: 中
     - ユーザー価値: 高

慎重検討:
  3. ソーシャルメディア連携
     - 実装価値: 中
     - 技術難易度: 中
     - リスク: 中
```

### 7.2 中長期検討事項（Phase 3以降）

```yaml
業界連携:
  - 配給会社との正式データ提携
  - 劇場チェーンとの情報連携
  - 映画関連メディアとの協力

技術拡張:
  - AI・ML API活用
  - リアルタイム分析・推薦
  - 多言語・国際展開対応

ビジネス展開:
  - 有料API・データ販売
  - アフィリエイト・パートナーシップ
  - B2B向けサービス展開
```

### 7.3 成功のための重要要因

```yaml
技術面:
  - 段階的実装・検証
  - 堅牢なエラー処理・フォールバック
  - 継続的な監視・最適化

法務・コンプライアンス:
  - 利用規約の厳格な遵守
  - 定期的な法的リスク評価
  - 業界ベストプラクティスの採用

ビジネス面:
  - ユーザー価値の明確化
  - コスト・効果の定量評価
  - 持続可能な連携関係構築
```

---

**作成者**: アーキテクトエージェント + データ担当
**協力**: 法務担当、ビジネス担当
**レビュー**: 全ステークホルダー
**承認**: プロジェクトマネージャー
**次回更新**: Phase 1実装完了後の実績反映
