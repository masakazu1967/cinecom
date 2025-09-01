# シーン検索UI/UXワイヤーフレーム

**作成日**: 2025年4月12日
**担当**: UX/UIデザインエージェント
**バージョン**: v1.0
**対象フェーズ**: Phase 2 並列技術検討

---

## 概要

映画シーン分類システムにおけるユーザーインターフェース設計案を提示します。田中氏提案のL-dialogue分類システムに対応し、時間入力の簡素化、並行シーンの可視化、レスポンシブデザインを実現します。

---

## 設計原則

### 1. ユーザビリティ原則

- **シンプルさ**: 3クリック以内でのシーン検索実現
- **直感性**: 映画愛好家が迷わない操作性
- **効率性**: データ入力時間の最小化

### 2. アクセシビリティ対応

- **WCAG 2.1 AA準拠**: 視覚・聴覚障害者対応
- **キーボード操作**: マウスレス操作完全対応
- **スクリーンリーダー**: 適切なARIA属性設定

### 3. パフォーマンス最優先

- **初期表示2秒以内**: 検索結果の即時表示
- **Progressive Loading**: データ段階的読み込み
- **Optimistic UI**: ユーザー操作の即時反映

---

## レスポンシブデザイン設計

### デバイス対応ブレークポイント

```css
/* Mobile First Approach */
@media (min-width: 320px)  { /* Mobile */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### 画面サイズ別レイアウト戦略

```text
Mobile (320px-767px):
┌─────────────────┐
│ Header          │
├─────────────────┤
│ Search Input    │
├─────────────────┤
│ Filters (縦積み)│
├─────────────────┤
│ Results (1列)   │
│ ┌─────────────┐ │
│ │ Scene Card  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Scene Card  │ │
│ └─────────────┘ │
└─────────────────┘

Tablet (768px-1023px):
┌─────────────────────────────────┐
│ Header                          │
├─────────────────────────────────┤
│ Search Input + Quick Filters    │
├─────────────────────────────────┤
│ Advanced Filters (水平展開)     │
├─────────────────────────────────┤
│ Results (2列グリッド)           │
│ ┌─────────┐ ┌─────────┐       │
│ │Scene Card│ │Scene Card│      │
│ └─────────┘ └─────────┘       │
└─────────────────────────────────┘

Desktop (1024px+):
┌───────────────────────────────────────────────────┐
│ Header Navigation                                │
├───────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────┐ │
│ │ Search &    │ │ Results Area (3-4列グリッド)    │ │
│ │ Filters     │ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │ │
│ │ Panel       │ │ │Scene│ │Scene│ │Scene│ │Scene│ │ │
│ │             │ │ │Card │ │Card │ │Card │ │Card │ │ │
│ │ (固定左側)  │ │ └─────┘ └─────┘ └─────┘ └─────┘ │ │
│ │             │ │                                 │ │
│ └─────────────┘ └─────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

## ワイヤーフレーム詳細

### 1. メイン検索画面（Desktop）

```text
┌─────────────────────────────────────────────────────────────────────┐
│ 🎬 CineCom                    [🔍] [👤Profile] [⚙Settings] [📤Export]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 🔍 シーン検索                                                          │
│ ┌──────────────────────────────────────────────────┐ [🔍 検索]     │
│ │ 映画タイトル、俳優名、キーワードを入力            │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                      │
│ ┌─── フィルター設定 ────┐ ┌─── 検索結果 ─────────────────────────────┐ │
│ │                      │ │                                           │ │
│ │ 📋 分類フィルター      │ │ 📊 152件のシーンが見つかりました (0.23秒)  │ │
│ │ ├□ L-台詞 (45)       │ │                                           │ │
│ │ │ ├□ L1-決め台詞      │ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │ │
│ │ │ ├□ L2-愛情告白      │ │ │🎬💬 │ │🎬⚔  │ │🎬😢 │ │🎬❤  │     │ │
│ │ │ └□ L3-別れ台詞      │ │ │01:23│ │05:47│ │12:34│ │23:12│     │ │
│ │ ├□ A-アクション (28)  │ │ │-45  │ │-02  │ │-56  │ │-08  │     │ │
│ │ └□ R-恋愛 (34)       │ │ │田中 │ │山田 │ │佐藤 │ │田中 │     │ │
│ │                      │ │ │太郎 │ │次郎 │ │花子 │ │太郎 │     │ │
│ │ 🎭 俳優フィルター      │ │ └─────┘ └─────┘ └─────┘ └─────┘      │ │
│ │ ├□ 田中太郎 (67)     │ │                                           │ │
│ │ ├□ 佐藤花子 (43)     │ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │ │
│ │ └□ 山田次郎 (29)     │ │ │🎬🚗 │ │🎬🌹 │ │🎬⚔  │ │🎬💭 │     │ │
│ │                      │ │ │34:21│ │43:12│ │56:33│ │01:02│     │ │
│ │ ⏰ 時間フィルター      │ │ │-45  │ │-08  │ │-21  │ │-15  │     │ │
│ │ 開始: [01:20:00]     │ │ │中村 │ │田中 │ │佐々木│ │山田 │     │ │
│ │ 終了: [01:30:00]     │ │ │一郎 │ │太郎 │ │健太 │ │次郎 │     │ │
│ │                      │ │ └─────┘ └─────┘ └─────┘ └─────┘      │ │
│ │ [🔄 フィルターリセット] │ │                                           │ │
│ │                      │ │ [< 前へ] [1] [2] [3] [4] [5] [次へ >]    │ │
│ └──────────────────────┘ └───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. シーン詳細モーダル（Desktop）

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ シーン詳細 ──────────────────────────────────────────────── [×] ┐ │
│ │                                                                  │ │
│ │ 🎬 「恋する惑星」 - 公園での告白シーン                             │ │
│ │                                                                  │ │
│ │ ⏰ 時間: 01:23:45 - 01:25:30 (105秒)                            │ │
│ │                                                                  │ │
│ │ 🏷️ 分類                                                          │ │
│ │ L > L2-愛情告白 > L2-1-初恋告白                                   │ │
│ │                                                                  │ │
│ │ 🎭 主要俳優                                                       │ │
│ │ • 田中太郎 (主人公・太郎役)                                       │ │
│ │ • 佐藤花子 (ヒロイン・花子役)                                     │ │
│ │                                                                  │ │
│ │ 💬 印象的な台詞                                                   │ │
│ │ ┌────────────────────────────────────────────────────────────┐ │ │
│ │ │ 「君が好きだ。ずっと前から。」                                  │ │ │
│ │ │ - 田中太郎 (01:24:12)                                          │ │ │
│ │ │                                                                │ │ │
│ │ │ 「私も... 待ってたの。」                                        │ │ │
│ │ │ - 佐藤花子 (01:24:45)                                          │ │ │
│ │ └────────────────────────────────────────────────────────────┘ │ │
│ │                                                                  │ │
│ │ 🏷️ タグ: #感動的 #純愛 #公園 #夕方 #桜                            │ │
│ │                                                                  │ │
│ │ 📝 説明                                                          │ │
│ │ 夕日が差し込む公園のベンチで、主人公が長年の想いを告白するシーン。   │ │
│ │ 桜の花びらが舞い散る中での純粋な愛の告白として映画史に残る名場面。   │ │
│ │                                                                  │ │
│ │ [🎬 映画詳細] [🎭 俳優情報] [📋 シーンリスト] [💾 ウォッチリスト追加] │ │
│ │                                                                  │ │
│ └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. 時間入力インターフェース（田中氏要求対応）

```text
┌─── シーン時間設定 ─────────────────────────────────────────────────┐
│                                                                    │
│ 🕐 開始時刻                                                         │
│ ┌──────────────────────┐ [📹 現在時刻取得]                         │
│ │ 012345               │                                            │
│ │ (01:23:45)          │ ← 自動変換表示                              │
│ └──────────────────────┘                                            │
│ 💡 ヒント: 6桁で入力（時分秒）例: 123045 = 12時30分45秒               │
│                                                                    │
│ ⏰ 終了時刻                                                         │
│ [ 絶対時刻 ] [ 経過秒数 ] ← タブ切り替え                             │
│                                                                    │
│ 絶対時刻モード:                                                     │
│ ┌──────────────────────┐                                            │
│ │ 012530               │                                            │
│ │ (01:25:30)          │ ← 自動変換表示                              │
│ └──────────────────────┘                                            │
│                                                                    │
│ 経過秒数モード:                                                     │
│ ┌──────────────────────┐ [⚡推奨値]                                  │
│ │ +105                 │ • 台詞: +5秒                               │
│ │ (= 01:25:30)        │ • アクション: +60秒                         │
│ └──────────────────────┘ • ドラマ: +30秒                           │
│                                                                    │
│ 📊 シーン長: 1分45秒                                                │
│                                                                    │
│ [💾 保存] [🔄 リセット] [❌ キャンセル]                              │
│                                                                    │
└────────────────────────────────────────────────────────────────┘
```

### 4. 並行シーン可視化（スプリットスクリーン対応）

```text
┌─── 並行シーン表示 ─────────────────────────────────────────────────┐
│                                                                    │
│ 🎬 「アクション・ヒーロー」シーン 01:23:45 - 01:25:30               │
│                                                                    │
│ 📊 タイムライン表示                                                 │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │01:23:45              01:24:30              01:25:30            │ │
│ │    │                     │                     │               │ │
│ │上画面│█████████████████████████████████████████████            │ │
│ │    │A3-1 拳銃戦（主人公サイド）                                  │ │
│ │    │                                                            │ │
│ │下画面│█████████████████████████████████████████████            │ │
│ │    │S2 緊迫（人質サイド）                                       │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ 🎭 シーン詳細                                                       │
│ ┌─ 上画面：拳銃戦シーン ──┐ ┌─ 下画面：人質シーン ──┐              │
│ │ 🏷️ A3-1-拳銃戦          │ │ 🏷️ S2-緊迫            │              │
│ │ 🎭 田中太郎（主人公）    │ │ 🎭 佐藤花子（人質）    │              │
│ │ 💬 「みんな逃げろ！」    │ │ 💬 「助けて...」       │              │
│ │ 📍 倉庫内部             │ │ 📍 倉庫2階             │              │
│ │                        │ │                        │              │
│ │ [🎬 詳細表示]           │ │ [🎬 詳細表示]          │              │
│ └──────────────────────┘ └──────────────────────┘              │
│                                                                    │
│ 📝 並行シーンの関係性                                               │
│ この2つのシーンは同一時間帯に異なる場所で同時進行しており、         │
│ 主人公の救出作戦と人質の心理描写を対比的に描いている。             │
│                                                                    │
│ [📋 関連シーン] [🔍 類似パターン] [💾 お気に入り]                   │
│                                                                    │
└────────────────────────────────────────────────────────────────┘
```

### 5. モバイル版検索画面

```text
┌─────────────────┐
│ 🎬 CineCom   [≡]│
├─────────────────┤
│                 │
│ 🔍 シーン検索    │
│ ┌─────────────┐ │
│ │キーワード入力 │ │
│ └─────────────┘ │
│ [🔍検索]         │
│                 │
│ 📋 フィルター ▼   │
│ ┌─────────────┐ │
│ │分類: 全て ▼  │ │
│ │俳優: 全て ▼  │ │
│ │時間: 指定なし▼│ │
│ └─────────────┘ │
│                 │
│ 📊 42件の結果    │
│                 │
│ ┌─────────────┐ │
│ │🎬💬 L2-愛情告白│ │
│ │01:23-45       │ │
│ │田中太郎       │ │
│ │「君が好きだ」  │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │🎬⚔ A1-格闘   │ │
│ │05:47-02       │ │
│ │山田次郎       │ │
│ │屋上での決闘   │ │
│ └─────────────┘ │
│                 │
│ [もっと見る]     │
│                 │
└─────────────────┘
```

---

## ユーザーフロー設計

### 1. 基本検索フロー

```text
開始
 ↓
メイン画面表示
 ↓
[キーワード入力] → [検索実行] → [結果表示]
 ↓                    ↓           ↓
[フィルター設定] ←───[絞り込み] → [シーン詳細]
 ↓                               ↓
[結果更新] ←─────────────────[関連シーン]
 ↓
[ウォッチリスト追加/映画詳細/俳優詳細]
 ↓
完了
```

### 2. データ入力フロー（プロフェッショナルユーザー）

```text
管理画面ログイン
 ↓
映画選択/新規追加
 ↓
シーン一覧表示
 ↓
[新規シーン追加]
 ↓
時間設定（HHMMSS + 相対時間）
 ↓
分類設定（L1 → L2 → L3）
 ↓
俳優・台詞情報入力
 ↓
プレビュー確認
 ↓
保存・公開
```

### 3. 並行シーン検索フロー

```text
検索結果表示
 ↓
[時間フィルター設定]
 ↓
並行シーン検出
 ↓
タイムライン表示
 ↓
[シーン選択] → [詳細表示] → [関係性説明]
 ↓
[類似パターン検索] / [関連作品検索]
```

---

## インタラクション設計

### 1. マイクロインタラクション

#### 検索結果表示アニメーション

```css
/* 検索結果のステージング表示 */
.scene-card {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.scene-card.animate-in {
  opacity: 1;
  transform: translateY(0);
  animation-delay: calc(var(--index) * 0.1s);
}

/* ホバーエフェクト */
.scene-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}
```

#### 時間入力フィードバック

```javascript
// HHMMSS入力の自動フォーマット
function formatTimeInput(input) {
  // 012345 → 01:23:45 への自動変換表示
  const digits = input.replace(/\D/g, '').substring(0, 6);
  if (digits.length >= 6) {
    const hours = digits.substring(0, 2);
    const minutes = digits.substring(2, 4);
    const seconds = digits.substring(4, 6);
    return `${hours}:${minutes}:${seconds}`;
  }
  return input;
}

// 相対時間計算のリアルタイム表示
function calculateEndTime(startSeconds, relativeDuration) {
  const endSeconds = startSeconds + relativeDuration;
  return secondsToHHMMSS(endSeconds);
}
```

### 2. 状態管理とフィードバック

#### 検索状態の可視化

```text
🔍 検索中...     → ローディングスピナー + 「検索中」
✅ 152件の結果   → 成功状態 + 結果数 + 実行時間
❌ 結果なし      → 空状態 + 検索条件見直しの提案
⚠️ エラー発生    → エラーメッセージ + 再試行オプション
```

#### プログレッシブローディング

```javascript
// 検索結果の段階的表示
const progressiveLoad = {
  phase1: '基本情報（タイトル・俳優・分類）', // 0.2秒
  phase2: '台詞情報・詳細説明',              // 0.5秒
  phase3: '関連シーン・推薦情報'             // 1.0秒
};
```

---

## アクセシビリティ対応

### 1. キーボードナビゲーション

```html
<!-- フォーカス順序の最適化 -->
<div class="search-interface" role="main">
  <input type="search"
         aria-label="シーン検索キーワード入力"
         placeholder="映画タイトル、俳優名、キーワードを入力"
         tabindex="1">
  <button type="submit" tabindex="2">検索</button>

  <div class="filters" role="complementary">
    <fieldset tabindex="3">
      <legend>分類フィルター</legend>
      <input type="checkbox" id="L1" tabindex="4">
      <label for="L1">L1-決め台詞</label>
    </fieldset>
  </div>

  <div class="results" role="region" aria-label="検索結果">
    <div class="scene-card" tabindex="5"
         role="button" aria-label="愛情告白シーン、01:23:45から45秒間、田中太郎出演">
    </div>
  </div>
</div>
```

### 2. スクリーンリーダー対応

```html
<!-- 検索結果の構造化情報 -->
<article class="scene-card"
         role="article"
         aria-labelledby="scene-title-123"
         aria-describedby="scene-details-123">

  <h3 id="scene-title-123">愛情告白シーン</h3>

  <div id="scene-details-123" aria-label="シーン詳細情報">
    <span aria-label="時間">01時23分45秒から1分45秒間</span>
    <span aria-label="分類">L2-愛情告白、L2-1-初恋告白</span>
    <span aria-label="出演者">田中太郎、佐藤花子</span>
    <span aria-label="台詞">「君が好きだ。ずっと前から。」</span>
  </div>

  <button aria-label="シーン詳細を表示">詳細表示</button>
</article>
```

### 3. 色彩・コントラスト対応

```css
/* WCAG AA準拠のカラーパレット */
:root {
  --primary-color: #2563eb;      /* 4.5:1 コントラスト比 */
  --secondary-color: #64748b;    /* 4.5:1 コントラスト比 */
  --success-color: #10b981;      /* 4.5:1 コントラスト比 */
  --warning-color: #f59e0b;      /* 4.5:1 コントラスト比 */
  --error-color: #ef4444;        /* 4.5:1 コントラスト比 */

  /* ダークモード対応 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1e293b;
    --bg-secondary: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
}

/* フォーカス指示の明確化 */
.focusable:focus {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}
```

---

## パフォーマンス最適化

### 1. 画像・アセット最適化

```javascript
// 遅延読み込み（Intersection Observer）
const lazyLoadImages = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      lazyLoadImages.unobserve(img);
    }
  });
});

// WebP対応
function getOptimalImageFormat(src) {
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp').indexOf('webp') > -1;

  return supportsWebP ? src.replace(/\.(jpg|jpeg|png)$/, '.webp') : src;
}
```

### 2. 仮想スクロール実装

```javascript
// 大量検索結果の効率的表示
class VirtualScroller {
  constructor(container, itemHeight = 200) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.renderBuffer = 5; // 上下余裕行数
  }

  render(items) {
    const containerHeight = this.container.clientHeight;
    const visibleCount = Math.ceil(containerHeight / this.itemHeight);
    const scrollTop = this.container.scrollTop;

    this.visibleStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.renderBuffer);
    this.visibleEnd = Math.min(items.length, this.visibleStart + visibleCount + this.renderBuffer * 2);

    // 表示範囲のアイテムのみレンダリング
    const visibleItems = items.slice(this.visibleStart, this.visibleEnd);
    this.renderItems(visibleItems, this.visibleStart);
  }
}
```

---

## デザインシステム

### 1. カラーパレット

```css
/* プライマリカラー */
.color-palette {
  --primary-50:  #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;  /* メインブランド */
  --primary-600: #2563eb;  /* ホバー */
  --primary-700: #1d4ed8;  /* アクティブ */

  /* セマンティックカラー */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #06b6d4;

  /* シーン分類別カラー */
  --scene-L: #ec4899;  /* L-台詞: ピンク */
  --scene-A: #ef4444;  /* A-アクション: 赤 */
  --scene-R: #f97316;  /* R-恋愛: オレンジ */
  --scene-D: #3b82f6;  /* D-ドラマ: 青 */
  --scene-C: #eab308;  /* C-コメディ: 黄 */
  --scene-S: #8b5cf6;  /* S-サスペンス: 紫 */
  --scene-O: #6b7280;  /* O-その他: グレー */
}
```

### 2. タイポグラフィ

```css
/* フォント階層 */
.typography {
  --font-family-base: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;

  /* フォントサイズ（rem単位） */
  --text-xs:  0.75rem;  /* 12px */
  --text-sm:  0.875rem; /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg:  1.125rem; /* 18px */
  --text-xl:  1.25rem;  /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  --text-3xl: 1.875rem; /* 30px */

  /* 行間 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 3. コンポーネント設計

```css
/* ボタンコンポーネント */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--primary-600);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-700);
  transform: translateY(-1px);
}

/* カードコンポーネント */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1rem;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

/* シーンカード専用 */
.scene-card {
  @extend .card;
  position: relative;
  cursor: pointer;
}

.scene-card__classification {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
}
```

---

## 技術実装ガイド

### 1. Next.js実装構造

```typescript
// pages/search/index.tsx - メイン検索ページ
export default function SceneSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<Scene[]>([]);

  // 検索APIコール（debounce付き）
  const debouncedSearch = useMemo(
    () => debounce(async (query: string, filters: SearchFilters) => {
      const response = await fetch('/api/v1/scenes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters })
      });
      const data = await response.json();
      setResults(data.scenes);
    }, 300),
    []
  );

  return (
    <Layout>
      <SearchInterface
        onSearch={debouncedSearch}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <SearchResults results={results} />
    </Layout>
  );
}

// components/SearchInterface.tsx
interface SearchInterfaceProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  filters,
  onFiltersChange
}) => {
  return (
    <div className="search-interface">
      <SearchInput onSearch={onSearch} />
      <FilterPanel filters={filters} onChange={onFiltersChange} />
    </div>
  );
};
```

### 2. 状態管理（Zustand）

```typescript
// store/searchStore.ts
interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Scene[];
  loading: boolean;
  error: string | null;

  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  search: () => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  filters: {},
  results: [],
  loading: false,
  error: null,

  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),

  search: async () => {
    set({ loading: true, error: null });
    try {
      const { query, filters } = get();
      const response = await searchScenes(query, filters);
      set({ results: response.scenes, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearResults: () => set({ results: [], query: '', filters: {} })
}));
```

---

## プロトタイプ検証

### 1. ユーザビリティテスト項目

```yaml
テストシナリオ:
  基本検索:
    - "恋愛シーンを探す"
    - 完了時間目標: 30秒以内
    - 成功基準: 適切な結果表示

  詳細検索:
    - "田中太郎の台詞シーンを2分以内で探す"
    - 完了時間目標: 1分以内
    - 成功基準: フィルター活用

  データ入力:
    - "新しいシーンを追加する"
    - 完了時間目標: 3分以内
    - 成功基準: 正確な時間入力

測定項目:
  - タスク完了率
  - 完了時間
  - エラー回数
  - ユーザー満足度（1-5スケール）
```

### 2. A/Bテスト対象

```yaml
テスト項目:
  時間入力方式:
    - A案: HHMMSS直接入力のみ
    - B案: HHMMSS + 相対時間の二択
    - 測定: 入力エラー率、入力時間

  検索結果表示:
    - A案: リスト表示
    - B案: カードグリッド表示
    - 測定: クリック率、滞在時間

  フィルター位置:
    - A案: 左サイドバー固定
    - B案: 上部折りたたみ
    - 測定: 使用率、検索効率
```

---

## 品質保証計画

### 1. デザイン品質チェックリスト

```yaml
視覚品質:
  - [ ] 全画面サイズでの表示確認
  - [ ] カラーコントラスト比WCAG AA準拠
  - [ ] フォント読みやすさ確認
  - [ ] アイコン・画像の一貫性

機能品質:
  - [ ] 検索機能の動作確認
  - [ ] フィルター機能の動作確認
  - [ ] 時間入力の検証機能
  - [ ] レスポンシブ動作確認

アクセシビリティ:
  - [ ] キーボードナビゲーション
  - [ ] スクリーンリーダー対応
  - [ ] 色覚障害者対応
  - [ ] 拡大表示対応
```

### 2. パフォーマンス目標

```yaml
読み込み速度:
  - 初期表示: 2秒以内
  - 検索結果: 1秒以内
  - 画面遷移: 0.5秒以内

ユーザビリティ:
  - 検索成功率: 95%以上
  - タスク完了時間: 目標の120%以内
  - ユーザー満足度: 4.0/5.0以上
```

---

**作成者**: UX/UIデザインエージェント
**協力**: アーキテクトエージェント、フロントエンドエージェント
**レビュー**: プロダクトオーナー
**次回更新**: プロトタイプ検証結果に基づいて
