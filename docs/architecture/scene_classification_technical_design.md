# シーン分類システム技術設計案

**作成日**: 2025年4月12日
**担当**: アーキテクトエージェント
**バージョン**: v1.0
**対象フェーズ**: Phase 2 並列技術検討

---

## 概要

映画・俳優データベースサービスにおけるシーン分類システムの技術設計案を提示します。田中氏提案のL-dialogue分類システムを含む階層構造に対応し、マイクロサービス構成での実現可能性を技術的に検証しました。

## システム構成図

### マイクロサービス構成

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │  Movie Service  │    │  Actor Service  │
│   (NestJS)      │    │   (NestJS)      │    │   (NestJS)      │
│   PostgreSQL    │    │   PostgreSQL    │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
         ┌─────────────────────────┼─────────────────────────┐
         │                        │                         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Scene Service  │    │ Review Service  │    │   API Gateway   │
│   (NestJS)      │    │   (NestJS)      │    │   (Express)     │
│   PostgreSQL    │    │   PostgreSQL    │    │   Rate Limiting │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### データフロー

```text
Frontend (Next.js)
      ↓
API Gateway (認証・ルーティング)
      ↓
┌─ Scene Service ←→ Movie Service
└─ Scene Service ←→ Actor Service
```

---

## 技術アーキテクチャ

### 1. マイクロサービス分割設計

#### Scene Service (シーンサービス)

- **責任範囲**: シーン分類・検索・時間管理
- **技術スタック**: NestJS + TypeScript + PostgreSQL
- **主要機能**:
  - L-dialogue分類システム (L1-L5)
  - 時間オーバーラップ検出
  - 並行シーン管理
  - 台詞管理・検索

#### Movie Service (映画サービス)

- **責任範囲**: 映画メタデータ・基本情報管理
- **技術スタック**: NestJS + TypeScript + PostgreSQL
- **主要機能**:
  - 映画基本情報管理
  - ジャンル分類
  - 公開情報・評価データ

#### Actor Service (俳優サービス)

- **責任範囲**: 俳優情報・キャスト管理
- **技術スタック**: NestJS + TypeScript + PostgreSQL
- **主要機能**:
  - 俳優プロフィール管理
  - フィルモグラフィー
  - キャスト関連性

#### User Service (ユーザーサービス)

- **責任範囲**: 認証・個人設定・ウォッチリスト
- **技術スタック**: NestJS + TypeScript + PostgreSQL
- **主要機能**:
  - JWT認証・認可
  - ユーザープリファレンス
  - ウォッチリスト管理

#### Review Service (レビューサービス)

- **責任範囲**: 評価・レビュー・推薦
- **技術スタック**: NestJS + TypeScript + PostgreSQL
- **主要機能**:
  - ユーザーレビュー
  - 評価システム
  - 推薦アルゴリズム

### 2. API設計アーキテクチャ

#### RESTful API 統一仕様

```typescript
// 基本エンドポイント構造
/api/v1/{service}/{resource}[/{id}][?params]

例：
GET /api/v1/scenes?classification=L1&movie=123
POST /api/v1/scenes
PUT /api/v1/scenes/456
DELETE /api/v1/scenes/456
```

#### 認証・認可方式

```typescript
// JWT + Bearer Token
Authorization: Bearer <jwt_token>

// 権限レベル
enum UserRole {
  VIEWER = 'viewer',           // 一般ユーザー
  CONTRIBUTOR = 'contributor', // データ入力者
  PROFESSIONAL = 'professional', // 業界関係者
  ADMIN = 'admin'             // 管理者
}
```

---

## 実装アプローチ

### 1. シーン分類システム実装

#### L-dialogue分類の技術実装

```typescript
// シーン分類エンティティ
@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  movieId: string;

  @Column('int')
  startTimeSeconds: number;  // HHMMSS → 秒変換

  @Column('int')
  endTimeSeconds: number;

  @Column('varchar', { length: 10 })
  level1Classification: string;  // A, R, C, S, D, L, O

  @Column('varchar', { length: 20 })
  level2Classification: string;  // A1, R3, L2 等

  @Column('varchar', { length: 50 })
  level3Classification: string;  // A1-1, L2-3 等

  @Column('json', { nullable: true })
  dialogue: {
    text: string;
    speaker: string;
    speakerCharacter: string;
    isMemorableQuote: boolean;
  };

  @Column('simple-array')
  mainActorIds: string[];

  @Column('simple-array')
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 時間オーバーラップ検出

```typescript
// PostgreSQL GiST インデックスを使用した高速検索
@Index('idx_scene_time_overlap', { synchronize: false })
// CREATE INDEX idx_scene_time_overlap ON scenes
// USING GIST (int4range(start_time_seconds, end_time_seconds));

@Injectable()
export class SceneService {
  async findOverlappingScenes(
    movieId: string,
    startTime: number,
    endTime: number
  ): Promise<Scene[]> {
    return this.sceneRepository
      .createQueryBuilder('scene')
      .where('scene.movieId = :movieId', { movieId })
      .andWhere(`int4range(:startTime, :endTime) && int4range(scene.startTimeSeconds, scene.endTimeSeconds)`)
      .setParameters({ startTime, endTime })
      .getMany();
  }
}
```

### 2. マイクロサービス間通信

#### 非同期通信パターン

```typescript
// Redis Pub/Sub を使用したイベント駆動アーキテクチャ
@Injectable()
export class SceneEventService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    private movieService: MovieServiceClient
  ) {}

  async publishSceneCreated(scene: Scene): Promise<void> {
    await this.redis.publish('scene.created', JSON.stringify({
      sceneId: scene.id,
      movieId: scene.movieId,
      classification: scene.level1Classification,
      timestamp: new Date()
    }));
  }

  @EventPattern('scene.created')
  async handleSceneCreated(data: SceneCreatedEvent): Promise<void> {
    // Movie Serviceに統計データ更新要求
    await this.movieService.updateSceneStatistics(data.movieId);
  }
}
```

### 3. パフォーマンス最適化

#### キャッシング戦略

```typescript
// Redis L1キャッシュ + CDN L2キャッシュ
@Injectable()
export class SceneCacheService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis
  ) {}

  private getCacheKey(key: string, params: any): string {
    return `scenes:${key}:${crypto.createHash('md5').update(JSON.stringify(params)).digest('hex')}`;
  }

  async getOrSetCache<T>(
    key: string,
    params: any,
    fetcher: () => Promise<T>,
    ttl: number = 300 // 5分
  ): Promise<T> {
    const cacheKey = this.getCacheKey(key, params);
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await fetcher();
    await this.redis.setex(cacheKey, ttl, JSON.stringify(result));
    return result;
  }

  // 使用例：シーン検索結果のキャッシュ
  async searchScenesWithCache(query: SceneSearchQuery): Promise<Scene[]> {
    return this.getOrSetCache(
      'search',
      query,
      () => this.sceneService.searchScenes(query),
      600 // 10分キャッシュ
    );
  }
}
```

---

## データ構造設計

### 1. L-dialogue階層対応データ構造

```json
{
  "sceneId": "scene_001",
  "movieId": "movie_123",
  "timeInfo": {
    "startTimeSeconds": 4425,
    "endTimeSeconds": 4530,
    "inputFormat": {
      "startInput": "012345",
      "endInput": "+105"
    },
    "duration": 105
  },
  "classification": {
    "level1": {
      "code": "L",
      "name": "台詞",
      "description": "印象的な台詞・名言が主体のシーン"
    },
    "level2": {
      "code": "L2",
      "name": "愛情告白",
      "description": "恋愛系の告白・愛の言葉・プロポーズの言葉"
    },
    "level3": {
      "code": "L2-1",
      "name": "初恋告白",
      "description": "初めての愛の告白・純愛系"
    }
  },
  "sceneMetadata": {
    "sceneType": "primary",
    "parentSceneId": null,
    "mainActors": [
      {
        "actorId": "actor_001",
        "characterName": "田中太郎",
        "role": "primary"
      }
    ]
  },
  "dialogue": {
    "text": "君が好きだ。ずっと前から。",
    "speaker": "actor_001",
    "speakerCharacter": "田中太郎",
    "isMemorableQuote": true,
    "emotionalTags": ["romantic", "sincere", "touching"]
  },
  "technicalInfo": {
    "tags": ["intense", "dramatic", "memorable"],
    "description": "公園のベンチでの告白シーン"
  }
}
```

### 2. 並行シーン管理構造

```typescript
interface ParallelSceneGroup {
  groupId: string;
  movieId: string;
  timeRange: {
    startTimeSeconds: number;
    endTimeSeconds: number;
  };
  scenes: Scene[];
  relationType: 'split_screen' | 'parallel_narrative' | 'overlapping_events';
  description: string;
}

// 並行シーン検索・管理
@Injectable()
export class ParallelSceneService {
  async findParallelScenes(movieId: string, timeRange: TimeRange): Promise<ParallelSceneGroup[]> {
    const overlappingScenes = await this.sceneService.findOverlappingScenes(
      movieId,
      timeRange.startTimeSeconds,
      timeRange.endTimeSeconds
    );

    return this.groupScenesByOverlap(overlappingScenes);
  }

  private groupScenesByOverlap(scenes: Scene[]): ParallelSceneGroup[] {
    // 時間オーバーラップによるシーングルーピングロジック
    // 同一時間帯のシーンを自動検出・グループ化
  }
}
```

---

## 技術的実現可能性検証

### 1. パフォーマンス要件達成

#### 検索応答時間目標

- **目標**: 検索結果2-3秒以内（田中氏要求）
- **達成方法**:
  - PostgreSQL GiSTインデックス使用
  - Redis L1キャッシング（主要検索結果）
  - CDN L2キャッシング（静的データ）

#### 負荷試験結果見込み

```text
同時接続数: 1,000ユーザー
検索クエリ: 100req/sec
想定応答時間:
- キャッシュヒット: 50-100ms
- DB直接クエリ: 200-500ms
- 複雑検索: 500ms-1s
```

### 2. スケーラビリティ検証

#### データ規模対応

- **初期**: 100映画 × 平均50シーン = 5,000シーン
- **中期**: 1,000映画 × 平均50シーン = 50,000シーン
- **長期**: 10,000映画 × 平均50シーン = 500,000シーン

#### マイクロサービス水平拡張

```yaml
# Kubernetes Deployment例
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scene-service
spec:
  replicas: 3  # 負荷に応じてオートスケーリング
  selector:
    matchLabels:
      app: scene-service
  template:
    spec:
      containers:
      - name: scene-service
        image: cinecom/scene-service:v1.0
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 3. 技術リスク評価

#### 特定された技術リスク

| リスク項目 | 影響度 | 発生確率 | 対策 |
|-----------|--------|----------|------|
| 時間オーバーラップ検索の性能 | 高 | 中 | GiSTインデックス + キャッシング |
| マイクロサービス間通信遅延 | 中 | 中 | 非同期処理 + Circuit Breaker |
| L-dialogue分類の複雑性 | 中 | 低 | 段階的実装 + 検証 |
| データ一貫性管理 | 高 | 低 | Saga Pattern + Event Sourcing |

---

## API設計初案

### 1. Scene Service API

```typescript
// シーン検索API
GET /api/v1/scenes?classification=L2&movie=123&timeRange=4400-4600
Response: {
  "scenes": [Scene[]],
  "totalCount": number,
  "facets": {
    "classifications": { "L1": 5, "L2": 3, "L3": 1 },
    "actors": { "actor_001": 8, "actor_002": 2 }
  },
  "queryTime": "250ms"
}

// シーン作成API
POST /api/v1/scenes
Request: {
  "movieId": "movie_123",
  "startTime": "012345",  // HHMMSS形式
  "endTime": "+105",      // 相対時間
  "classification": {
    "level1": "L",
    "level2": "L2",
    "level3": "L2-1"
  },
  "dialogue": {
    "text": "君が好きだ。",
    "speaker": "actor_001",
    "isMemorableQuote": true
  },
  "mainActors": ["actor_001"]
}

// 並行シーン検索API
GET /api/v1/scenes/parallel?movie=123&timeRange=4400-4600
Response: {
  "parallelGroups": [ParallelSceneGroup[]],
  "timeline": TimelineVisualization
}
```

### 2. 認証・認可API

```typescript
// JWT認証
POST /api/v1/auth/login
Request: { "email": "user@example.com", "password": "***" }
Response: { "accessToken": "jwt_token", "refreshToken": "refresh_token" }

// 権限確認
GET /api/v1/auth/permissions
Headers: { "Authorization": "Bearer jwt_token" }
Response: {
  "role": "professional",
  "permissions": ["scene.read", "scene.write", "movie.read"]
}
```

---

## 実装優先順位

### Phase 1: 基盤構築 (Week 1-2)

- [ ] マイクロサービス基盤構築
- [ ] Scene Service基本機能
- [ ] PostgreSQL スキーマ設計
- [ ] API Gateway構築

### Phase 2: コア機能実装 (Week 3-4)

- [ ] L-dialogue分類システム
- [ ] 時間オーバーラップ検出
- [ ] 基本検索機能
- [ ] 台詞管理機能

### Phase 3: 高度機能実装 (Week 5-6)

- [ ] 並行シーン管理
- [ ] キャッシング最適化
- [ ] パフォーマンスチューニング
- [ ] プロフェッショナル機能

### Phase 4: 統合・品質確保 (Week 7-8)

- [ ] マイクロサービス統合テスト
- [ ] パフォーマンステスト
- [ ] セキュリティ監査
- [ ] 本番デプロイ準備

---

## 技術選定根拠

### 1. NestJS選定理由

- **TypeScript統一**: フロントエンド・バックエンド開発効率
- **decorator基盤**: 認証・バリデーション・キャッシングの統一実装
- **マイクロサービス対応**: 標準サポート

### 2. PostgreSQL選定理由

- **GiSTインデックス**: 時間オーバーラップ高速検索
- **JSON対応**: 柔軟なデータ構造格納
- **ACID準拠**: データ一貫性保証

### 3. Redis選定理由

- **L1キャッシング**: 検索結果の高速化
- **Pub/Sub**: マイクロサービス間通信
- **セッション管理**: JWT補完

---

## 品質保証

### 1. テスト戦略

- **単体テスト**: Jest (カバレッジ90%以上)
- **統合テスト**: Supertest (API境界テスト)
- **E2Eテスト**: Cypress (ユーザーシナリオ)
- **負荷テスト**: k6 (パフォーマンス検証)

### 2. 監視・ログ

- **アプリケーションログ**: Winston (構造化ログ)
- **メトリクス収集**: Prometheus + Grafana
- **分散トレーシング**: Jaeger (マイクロサービス通信追跡)
- **ヘルスチェック**: Kubernetes Liveness/Readiness

---

**作成者**: アーキテクトエージェント
**レビュー**: 技術リード
**承認**: プロジェクトマネージャー
**次回更新**: 実装進捗に応じて
