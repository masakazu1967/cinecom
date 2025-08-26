# パフォーマンス最適化ガイドライン

## 目次
- [データベース最適化](#データベース最適化)
- [フロントエンド最適化](#フロントエンド最適化)
- [バックエンド最適化](#バックエンド最適化)
- [キャッシング戦略](#キャッシング戦略)
- [モニタリング指標](#モニタリング指標)
- [パフォーマンステスト](#パフォーマンステスト)

## データベース最適化

### クエリ最適化
- N+1問題を回避するため、適切な`eager loading`を使用
- 必要な列のみを選択（SELECT *を避ける）
- 適切なインデックスの設定
- クエリプランの定期的な見直し

### データベース設計
- 正規化と非正規化のバランスを考慮
- パーティショニングの検討
- 読み書きの分離（Read/Write Splitting）

```typescript
// 良い例: 必要な列のみ選択
const movies = await this.movieRepository.find({
  select: ['id', 'title', 'releaseDate'],
  relations: ['genres'],
});

// 悪い例: 全列を取得
const movies = await this.movieRepository.find({
  relations: ['genres', 'cast', 'reviews'],
});
```

## フロントエンド最適化

### React パフォーマンス
- `React.memo`、`useMemo`、`useCallback`の適切な使用
- 仮想化（React Window/React Virtualized）の活用
- Code Splittingの実装
- 画像の遅延読み込み

```tsx
// メモ化の適切な使用例
const MovieList = React.memo(({ movies, onMovieSelect }: MovieListProps) => {
  const sortedMovies = useMemo(() => 
    movies.sort((a, b) => a.title.localeCompare(b.title)),
    [movies]
  );

  const handleSelect = useCallback((id: string) => {
    onMovieSelect(id);
  }, [onMovieSelect]);

  return (
    <div>
      {sortedMovies.map(movie => (
        <MovieCard key={movie.id} movie={movie} onSelect={handleSelect} />
      ))}
    </div>
  );
});
```

### バンドル最適化
- Tree shakingの活用
- 動的インポートによるコード分割
- 未使用コードの除去
- 適切なprefetchingとpreloading

## バックエンド最適化

### アプリケーションレベル
- 適切な非同期処理の実装
- コネクションプールの最適化
- メモリリークの防止
- CPU集約的処理の最適化

```typescript
// 並列処理の実装例
async getMovieDetails(movieId: string): Promise<MovieDetailsDto> {
  const [movie, reviews, ratings] = await Promise.all([
    this.movieRepository.findById(movieId),
    this.reviewRepository.findByMovieId(movieId),
    this.ratingRepository.getAverageRating(movieId),
  ]);

  return this.mapToDto(movie, reviews, ratings);
}
```

### API最適化
- レスポンスの圧縮（gzip）
- 適切なHTTPキャッシュヘッダーの設定
- API結果のページネーション
- GraphQLのN+1問題対策

## キャッシング戦略

### キャッシュレイヤー
1. **ブラウザキャッシュ**: 静的アセット
2. **CDNキャッシュ**: グローバル配信
3. **アプリケーションキャッシュ**: Redis/Memcached
4. **データベースキャッシュ**: クエリ結果

### キャッシュ戦略パターン
- **Cache-Aside**: アプリケーションがキャッシュを管理
- **Write-Through**: 書き込み時にキャッシュも更新
- **Write-Behind**: 非同期でキャッシュから永続化
- **Refresh-Ahead**: 期限切れ前にリフレッシュ

```typescript
@Injectable()
export class MovieCacheService {
  constructor(private readonly redisClient: Redis) {}

  async getMovie(id: string): Promise<Movie | null> {
    // Cache-Aside パターン
    const cached = await this.redisClient.get(`movie:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const movie = await this.movieRepository.findById(id);
    if (movie) {
      await this.redisClient.setex(
        `movie:${id}`, 
        3600, // 1時間のTTL
        JSON.stringify(movie)
      );
    }
    return movie;
  }
}
```

## モニタリング指標

### フロントエンド指標
- **First Contentful Paint (FCP)**: 初回コンテンツ描画時間
- **Largest Contentful Paint (LCP)**: 最大コンテンツ描画時間
- **First Input Delay (FID)**: 初回入力遅延
- **Cumulative Layout Shift (CLS)**: レイアウトのずれ

### バックエンド指標
- **レスポンス時間**: 平均・95パーセンタイル・99パーセンタイル
- **スループット**: 秒間リクエスト数
- **エラー率**: 4xx/5xxエラーの割合
- **可用性**: アップタイム

### インフラ指標
- **CPU使用率**: システム負荷
- **メモリ使用率**: メモリリークの検出
- **ディスクI/O**: ストレージ性能
- **ネットワーク帯域**: 通信状況

## パフォーマンステスト

### テストの種類
1. **ロードテスト**: 通常負荷での動作確認
2. **ストレステスト**: 限界負荷での動作確認
3. **スパイクテスト**: 急激な負荷変動への対応
4. **ボリュームテスト**: 大量データでの動作確認

### テストツール
- **Artillery**: API負荷テスト
- **Lighthouse**: フロントエンド性能測定
- **WebPageTest**: 実環境での性能測定
- **New Relic/DataDog**: APMツール

```javascript
// Artillery設定例
module.exports = {
  config: {
    target: 'http://localhost:3000',
    phases: [
      { duration: 60, arrivalRate: 10 }, // 1分間で10req/sec
      { duration: 120, arrivalRate: 50 }, // 2分間で50req/sec
      { duration: 60, arrivalRate: 10 }, // 1分間で10req/secに戻す
    ],
  },
  scenarios: [
    {
      name: 'Get movies',
      weight: 70,
      flow: [
        { get: { url: '/api/movies' } },
      ],
    },
    {
      name: 'Get movie details',
      weight: 30,
      flow: [
        { get: { url: '/api/movies/{{ $randomInt(1, 1000) }}' } },
      ],
    },
  ],
};
```

### パフォーマンス目標
- **API応答時間**: 95%ile < 200ms
- **ページ読み込み時間**: LCP < 2.5秒
- **可用性**: 99.9%以上
- **エラー率**: < 0.1%

### 継続的最適化
1. **定期的な性能測定**: 週次/月次での計測
2. **パフォーマンス予算**: 各指標の閾値設定
3. **自動アラート**: 閾値超過時の通知
4. **改善施策の効果測定**: A/Bテスト等での検証

## ベストプラクティス

### 開発段階での配慮
- パフォーマンス要件の早期定義
- 性能テストの自動化
- 継続的な最適化の文化醸成
- チーム全体での性能意識共有

### 運用段階での配慮
- 定期的な性能レビュー
- 容量計画の策定
- インシデント対応手順の整備
- 改善ロードマップの策定