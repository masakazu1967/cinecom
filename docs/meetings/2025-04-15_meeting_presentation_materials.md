# ステークホルダー会議プレゼンテーション資料

**日時**: 2025年4月15日（火）14:00-16:00
**対象**: 田中太郎氏、佐藤花子氏、山田次郎氏
**資料作成**: 2025年4月14日

---

## 🎯 会議目標の再確認

### **プロジェクトのマイルストーン**

- ✅ Phase 1: 要求分析完了（4/5-4/10）
- ✅ Phase 2: 並列技術検討完了（4/8-4/12）
- ✅ Phase 3: ステークホルダー準備確認完了（4/10-4/12）
- 🔄 **Phase 4: 準備完了・資料統合**（4/13-4/14）→ **本日完成**

### **本日の決定事項**

1. **シーン分類システム仕様の最終決定**
2. **プロトタイプ開発のGo/No-Go判断**
3. **次フェーズのアクションプラン合意**

---

## 📋 開発チーム成果物サマリー

### **1. 要求分析結果**

#### **構造化された機能要求（優先度順）**

| 優先度 | 要求ID | 機能名 | ステークホルダー | 実装難易度 |
|---|---|---|---|---|
| **Critical** | FR-001 | 映画・俳優基本検索 | 全員 | Low |
| **Critical** | FR-002 | シーン分類検索 | 田中氏、山田氏 | High |
| **High** | FR-003 | パーソナライズ機能 | 田中氏 | Medium |
| **High** | FR-004 | 統計・分析機能 | 佐藤氏、山田氏 | Medium |
| **Medium** | FR-005 | データエクスポート | 山田氏 | Low |

#### **非機能要求の明確化**

- **パフォーマンス**: 検索応答時間 < 2秒
- **スケーラビリティ**: 同時ユーザー数 1,000人対応
- **可用性**: 99.9% uptime目標
- **セキュリティ**: GDPR準拠、個人情報保護

### **2. 特定された課題と解決提案**

#### **🔴 Critical課題: シーン分類の一貫性確保**

**問題**:

- 田中氏: 感情ベース分類（感動的、スリリング、笑える等）
- 山田氏: 技術・文化ベース分類（撮影技法、社会的コンテクスト等）
- 佐藤氏: マーケティングベース分類（観客動員、話題性等）

**解決提案**:

```text
1. 統一分類ガイドライン策定
   - 各観点を包含する多層分類システム
   - 具体的な分類基準と例示

2. 品質保証プロセス
   - 初期: 複数人による分類確認
   - 将来: 機械学習による分類支援

3. 段階的改善アプローチ
   - MVP: 基本分類のみで開始
   - Phase 2: 詳細分類の段階的追加
```

#### **🟡 High課題: データ入力効率化**

**問題**: 手動データ入力 vs 高品質要求

**解決提案**:

```text
1. データ入力支援ツール開発
   - 時間入力の簡素化UI
   - テンプレート機能
   - 一括編集機能

2. 段階的データ構築
   - Phase 1: 100作品（佐藤氏提供データ）
   - Phase 2: 500作品（主要配給作品）
   - Phase 3: 1000作品（重要歴史的作品）

3. コミュニティ参加型拡充
   - 将来的な一般ユーザー参加
   - 品質管理フロー整備
```

---

## 🏗️ 技術アーキテクチャ設計

### **システム全体構成**

```text
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                       │
│  Next.js + TypeScript + Tailwind CSS + Responsive      │
└─────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────┐
│                   API Gateway                           │
│     Express.js + Rate Limiting + Authentication        │
└─────────────────────────────────────────────────────────┘
                                │
        ┌───────────┬─────────────┬───────────┬─────────────┐
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│User Service│ │Movie Service│ │Actor Service│ │Scene Service│ │Review Service│
│  (NestJS) │ │  (NestJS)  │ │  (NestJS)  │ │  (NestJS)   │ │  (NestJS)    │
│PostgreSQL │ │ PostgreSQL │ │ PostgreSQL │ │ PostgreSQL  │ │ PostgreSQL   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
```

### **シーン分類システムの技術実装**

#### **田中氏L-dialogue分類への対応**

```sql
-- 3階層構造のテーブル設計
CREATE TABLE scene_categories (
    id UUID PRIMARY KEY,
    level INTEGER NOT NULL,           -- 1, 2, 3
    parent_id UUID REFERENCES scene_categories(id),
    name VARCHAR NOT NULL,
    description TEXT
);

-- 並行シーン対応
CREATE TABLE scenes (
    id UUID PRIMARY KEY,
    movie_id UUID NOT NULL,
    start_time INTEGER NOT NULL,      -- 秒単位
    end_time INTEGER NOT NULL,
    parallel_group_id UUID,           -- 並行シーン識別
    category_id UUID REFERENCES scene_categories(id)
);
```

#### **時間入力簡素化の実装**

```typescript
// 直感的な時間入力UI
interface TimeInputProps {
  value: { minutes: number; seconds: number };
  onChange: (time: { minutes: number; seconds: number }) => void;
  placeholder?: string; // "1:23:45 or 83:45"
}

// 自動時間検証・補完機能
const validateAndCompleteTime = (input: string) => {
  // "1:23" → 1分23秒
  // "83:45" → 1時間23分45秒
  // "1:23:45" → 1時間23分45秒
};
```

---

## 🗄️ データベース設計詳細

### **パフォーマンス最適化設計**

#### **インデックス戦略**

```sql
-- シーン検索高速化
CREATE INDEX idx_scenes_category_time ON scenes(category_id, start_time);
CREATE INDEX idx_scenes_movie_parallel ON scenes(movie_id, parallel_group_id);

-- 全文検索対応
CREATE INDEX idx_movies_fulltext ON movies USING GIN(to_tsvector('japanese', title_jp || ' ' || description));
```

#### **パーティショニング戦略**

```sql
-- 年代別パーティショニング
CREATE TABLE scenes (
    -- 基本フィールド
) PARTITION BY RANGE (movie_release_year);

CREATE TABLE scenes_2020s PARTITION OF scenes FOR VALUES FROM (2020) TO (2030);
CREATE TABLE scenes_2010s PARTITION OF scenes FOR VALUES FROM (2010) TO (2020);
```

### **マイクロサービス間データ整合性**

#### **サービス間通信パターン**

```typescript
// イベント駆動アーキテクチャ
interface SceneCreatedEvent {
  sceneId: string;
  movieId: string;
  categoryId: string;
  timestamp: Date;
}

// Saga パターンによる分散トランザクション
class SceneCreationSaga {
  async execute(sceneData: CreateSceneDto) {
    const movie = await this.movieService.validateMovie(sceneData.movieId);
    const category = await this.categoryService.validateCategory(sceneData.categoryId);
    const scene = await this.sceneService.createScene(sceneData);
    await this.notificationService.notifySceneCreated(scene);
  }
}
```

---

## 🎨 UI/UX設計のハイライト

### **レスポンシブデザイン**

#### **モバイルファースト設計**

```css
/* 段階的機能公開 */
.scene-search-advanced {
  display: none;
}

@media (min-width: 768px) {
  .scene-search-advanced {
    display: block;
  }
}

@media (min-width: 1024px) {
  .scene-timeline {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

#### **ユーザビリティ重視設計**

**検索フロー（3クリック以内）**:

1. **ホーム** → シーン分類選択
2. **分類選択** → 詳細フィルタ
3. **結果表示** → 作品詳細

**データ入力フロー簡素化**:

1. **映画選択** → 自動基本情報取得
2. **シーン追加** → タイムライン表示
3. **分類選択** → ガイド表示

---

## 📊 ステークホルダー提供資料の活用計画

### **1. 田中氏シーン分類提案の実装状況**

#### **✅ 実装予定機能**

- **3階層分類システム**: データベース設計完了
- **時間入力簡素化**: UI/UX設計完了
- **並行シーン対応**: 技術実装方針決定
- **感情タグシステム**: 拡張可能設計採用

#### **🔄 追加検討事項**

- **分類ガイドライン**: 本日合意予定
- **ユーザビリティテスト**: プロトタイプ段階で実施

### **2. 佐藤氏初期データの技術統合**

#### **✅ データ構造適合性確認済み**

```json
{
  "id": "M001",
  "title_jp": "夢の向こう側",
  "title_en": "Beyond Dreams",
  "year": 2023,
  "scene_info_level": "high",  // ← 分類作業優先度
  "technical_specs": {
    "duration": 128,
    "resolution": "4K"
  }
}
```

#### **🔄 データ拡充ロードマップ**

- **Phase 1**: 100作品 → システム基盤構築
- **Phase 2**: 500作品 → 本格運用開始
- **Phase 3**: 1000作品 → 高度分析機能提供

### **3. 山田氏専門機能要求の実装計画**

#### **✅ 実装予定機能**

- **高度検索機能**: Elasticsearch統合予定
- **統計分析機能**: データウェアハウス構築
- **データエクスポート**: CSV/JSON/PDF対応

#### **🔄 実装優先度**

1. **High**: 基本統計機能（集計・グラフ表示）
2. **Medium**: 関連性分析（俳優間関係、ジャンル傾向）
3. **Low**: 高度分析（機械学習ベース推薦）

---

## 🚀 次フェーズ提案

### **プロトタイプ開発計画（2025年4月16日-5月15日）**

#### **Week 1-2: 基盤構築**

- マイクロサービス基本構造実装
- データベーススキーマ構築
- 基本API実装

#### **Week 3-4: コア機能実装**

- シーン分類システム実装
- 基本検索機能実装
- UI基本画面実装

#### **Week 4: 統合テスト・デモ準備**

- システム統合
- 初期データ投入
- ステークホルダーデモ準備

### **成功基準**

- [ ] 基本検索機能動作確認
- [ ] シーン分類システム基本機能確認
- [ ] UI/UXの基本フロー確認
- [ ] パフォーマンス目標達成（検索 < 2秒）

---

## ❓ 本日の決定事項・確認事項

### **即座に決定が必要な事項**

1. **シーン分類ガイドライン策定方針**
   - 誰が主導するか（田中氏 vs 開発チーム vs 協働）
   - 策定スケジュール
   - 品質保証プロセス

2. **プロトタイプ開発のGo判断**
   - 技術実装の妥当性確認
   - リソース・スケジュール合意
   - 成功基準の明確化

3. **データ入力作業分担**
   - 各ステークホルダーの役割
   - 品質管理プロセス
   - 作業スケジュール

### **フィードバック歓迎事項**

- 技術設計案への懸念・提案
- UI/UX設計への改善提案
- データ構造への追加要求
- 実装優先度の調整提案

---

**資料作成**: プロジェクトマネージャー + 全エージェント
**最終更新**: 2025年4月14日 20:00
