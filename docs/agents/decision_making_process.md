# 意思決定プロセス

## Cinecom プロジェクト - エージェント協調システム

### 概要

本ドキュメントは、Cinecomプロジェクトにおけるエージェント間の意思決定プロセスを定義します。Claude Code環境でのレベル別意思決定権限と合意形成プロセスを詳述します。

**状況別意思決定方針**:
- **通常時**: 合意形成による意思決定（このドキュメント）
- **緊急時**: PMによる迅速な意思決定（`emergency_procedures.md`参照）

**緊急時意思決定への切り替えトリガー**:
- システム障害・重大機能不全
- Critical/High重要度の問題発生
- 即座対応が必要な技術的ブロッカー
- データ損失・セキュリティ侵害の可能性

### 決定権限レベル

#### **Level 0 (人間の最終判断)**: プロジェクト方向性・ビジネス要件

**対象**:

- 機能要件の追加・削除
- プロジェクトスコープ変更
- ビジネス価値に関わる判断

**プロセス**:

1. エージェントからの提案・課題報告
2. プロジェクトマネージャーによる人間承認依頼
3. 人間による最終判断
4. 決定事項の全エージェント共有

#### **Level 1 (自律判断)**: 各エージェントの専門領域内

**対象**:

- 実装方法の詳細
- 専門分野でのベストプラクティス適用
- パフォーマンス最適化

**プロセス**:

1. エージェントが専門知識に基づいて自律的に判断
2. 実装・作業実行
3. 結果をプロジェクトマネージャーに報告

#### **Level 2 (関連エージェント協議)**: 複数エージェントに影響

**対象**:

- API仕様変更
- データベーススキーマ変更
- UI/UX仕様変更
- マイクロサービス間インターフェース変更

**プロセス**:

1. 提案エージェントが変更提案作成
2. 影響を受けるエージェントを特定
3. GitHub PR/Issue経由での協議
4. 関連エージェントの合意形成
5. プロジェクトマネージャー承認
6. 実装・共有

#### **Level 3 (全体合意 + 人間承認)**: プロジェクト全体に影響

**対象**:

- 技術スタック変更
- アーキテクチャ根本変更
- スケジュール大幅変更
- マイクロサービス分割方針変更

**プロセス**:

1. 提案エージェントが詳細提案作成
2. 全エージェントでの影響分析
3. GitHub Issue/PRでの全体討議
4. エージェント間の合意形成
5. 人間による最終承認
6. 実装計画策定・実行

### 合意形成プロセス（Claude Code環境）

#### **1. 提案・通知**

担当エージェントが変更案を作成し、以下の方法で通知：

**GitHubプルリクエスト**: コード変更の場合

```yaml
目的: 実装変更・コード修正
対象: Level 1-2の技術的変更
プロセス: CODEOWNERS → 自動レビュアーアサイン → レビュー → マージ
```

**GitHubイシュー**: 仕様変更・新機能提案の場合

```yaml
目的: 仕様変更・新機能・課題提起
対象: Level 2-3の設計変更
プロセス: Issue作成 → ラベル付け → 関連エージェント通知 → 討議 → 決定
```

**ドキュメント更新**: 設計書・仕様書の変更

```yaml
目的: 設計書・仕様書・プロセス変更
対象: Level 2-3のドキュメント変更
プロセス: ドキュメント更新 → CODEOWNERS → レビュー → 承認
```

#### **2. 自動通知システム**

**通知トリガー**:

```yaml
PR作成時:
  アクション: 影響を受けるファイル・モジュールの担当エージェントに通知
  方法: CODEOWNERS機能で自動レビュアーアサイン
  対象: 該当ファイル・ディレクトリの責任エージェント

Issue作成時:
  アクション: ラベルに基づいて関連エージェントに通知
  方法: GitHub Webhook → Discord通知
  対象: ラベルに対応するエージェント

ドキュメント更新:
  アクション: CODEOWNERS機能で担当者自動アサイン
  方法: GitHub通知 + Discord連携
  対象: ドキュメント領域の責任エージェント
```

**通知方法**:

```yaml
GitHub Webhook:
  目的: 自動的なイベント通知
  対象: PR作成・マージ・Issue作成・コメント
  連携: Discord・外部システム

Discord チャンネル通知:
  目的: リアルタイム情報共有
  チャンネル:
    - "#cinecom-architecture": アーキテクチャ関連更新
    - "#cinecom-api": API仕様変更通知
    - "#cinecom-database": DB設計変更通知
    - "#cinecom-frontend": UI/UX設計変更通知
    - "#cinecom-human-review": 人間レビュー依頼・承認通知
    - "#cinecom-urgent": 緊急事態・期限切れ通知

Claude Code Taskツール:
  目的: エージェント間の作業依頼・相談
  方法: Task(subagent_type="...", description="...", prompt="...")
  対象: 特定エージェントへの作業・相談依頼

GitHub Issues/PR:
  目的: 構造化された協調・レビュー
  方法: Issue/PRテンプレート + ラベル + アサイン
  対象: 設計変更・実装レビュー・課題解決
```

#### **3. ドキュメント更新確認システム**

**CODEOWNERS設定例**:

```bash
# API仕様変更 (Level 2 - 人間レビュー必要)
/api/                    @backend-agent @frontend-agent @human-reviewer
/docs/api/               @backend-agent @frontend-agent @human-reviewer

# マイクロサービス関連
/services/user-service/  @backend-agent @database-agent
/services/movie-service/ @backend-agent @database-agent
/services/actor-service/ @backend-agent @database-agent
/services/scene-service/ @backend-agent @database-agent
/services/review-service/ @backend-agent @database-agent

# データベース関連 (Level 2 - 人間レビュー必要)
/migrations/             @database-agent @backend-agent @human-reviewer
/models/                 @database-agent @backend-agent @human-reviewer

# フロントエンド
/frontend/               @frontend-agent @ux-agent
/docs/design/            @ux-agent @frontend-agent

# 設計ドキュメント (Level 2-3 - 人間レビュー必要)
/docs/architecture/      @architect-agent @all-agents @human-reviewer
/docs/project/charter.md @pm-agent @human-reviewer
```

#### **4. 影響度判定・レビュー依頼**

**プルリクエスト・イシューテンプレート**:

```markdown
# プルリクエスト・イシューテンプレート
## 変更概要
- 変更内容の説明

## 影響を受けるサービス・エージェント（自動タグ付け）
- [ ] @frontend-agent (UI変更の場合)
- [ ] @backend-agent (API変更の場合)
- [ ] @database-agent (スキーマ変更の場合)
- [ ] user-service (ユーザー管理への影響)
- [ ] movie-service (映画データへの影響)
- [ ] scene-service (シーンデータへの影響)
- [ ] review-service (レビューシステムへの影響)

## 影響度レベル
- [ ] Level 1 (自律判断)
- [ ] Level 2 (関連エージェント協議)
- [ ] Level 3 (全体合意 + 人間承認)

## レビュー期限
- 期限: [作成日 + 2営業日]
```

#### **5. レビュー・合意形成**

**プロセス**:

1. **影響を受けるエージェントがGitHub上でレビュー・コメント**
   - 技術的観点からの評価
   - 自分の担当領域への影響分析
   - 代替案・改善提案

2. **必要時の追加協議**
   - Claude Code Task経由での詳細相談
   - GitHub Discussion機能での討議
   - Discord経由のリアルタイム相談

3. **合意形成後、承認プロセスへ**
   - Level 1-2: プロジェクトマネージャー承認
   - Level 3: 人間承認

#### **6. 決定・マージ**

**承認フロー**:

```yaml
Level 1 (自律判断):
  承認者: 担当エージェント
  プロセス: 自律的判断 → 実装 → PM報告

Level 2 (関連エージェント協議):
  承認者: プロジェクトマネージャーエージェント
  プロセス: 関連エージェント合意 → PM承認 → マージ

Level 3 (全体合意 + 人間承認):
  承認者: 人間 + プロジェクトマネージャー
  プロセス: 全エージェント合意 → 人間承認 → PM実行指示 → マージ
```

#### **7. 全体通知**

マージ後、全エージェントに変更内容を通知：

- **Discord自動通知**: 重要な変更の全体共有
- **GitHub Activity**: リポジトリ活動による自動通知
- **PMによるTodoWrite更新**: 進捗・状況の可視化

### 意思決定記録システム

#### **決定履歴の記録**

**記録場所**:

```yaml
GitHub:
  - Issue/PRでの討議履歴
  - コミット履歴・変更差分
  - レビューコメント・承認記録

.agents/decisions/:
  - decision-log.json: 構造化された決定履歴
  - impact-analysis.md: 影響分析記録
  - lessons-learned.md: 学習事項・改善点

docs/project/:
  - decision-history.md: 主要な意思決定の要約
  - architecture-decisions.md: アーキテクチャ決定記録(ADR)
```

**記録フォーマット**:

```json
{
  "decision_id": "DEC-20250822-001",
  "timestamp": "2025-08-22T14:30:00Z",
  "title": "シーンサービスのデータ構造変更",
  "level": 2,
  "proposer": "database-agent",
  "stakeholders": ["backend-agent", "frontend-agent"],
  "description": "シーンカテゴリの正規化レベル変更",
  "alternatives": [
    {
      "option": "第3正規形維持",
      "pros": ["データ整合性", "正規化原則遵守"],
      "cons": ["JOIN性能劣化", "クエリ複雑化"]
    },
    {
      "option": "非正規化",
      "pros": ["クエリ性能向上", "実装簡素化"],
      "cons": ["データ重複", "整合性リスク"]
    }
  ],
  "decision": "第3正規形維持 + パフォーマンス最適化",
  "rationale": "データ整合性を重視し、インデックス最適化で性能確保",
  "implementation_plan": [
    "インデックス設計見直し",
    "クエリ最適化",
    "パフォーマンステスト実施"
  ],
  "approval_chain": [
    {
      "role": "database-agent",
      "status": "approved",
      "timestamp": "2025-08-22T14:35:00Z"
    },
    {
      "role": "backend-agent", 
      "status": "approved",
      "timestamp": "2025-08-22T15:00:00Z"
    },
    {
      "role": "pm-agent",
      "status": "approved", 
      "timestamp": "2025-08-22T15:30:00Z"
    }
  ],
  "impact_assessment": {
    "technical": "中程度 - インデックス追加・クエリ修正",
    "timeline": "軽微 - 2日以内で対応可能",
    "resources": "database-agent + backend-agent",
    "risks": "性能劣化の可能性 - パフォーマンステストで検証"
  }
}
```

### エスカレーション・異議申し立て

#### **異議申し立てプロセス**

**対象**:

- Level 2決定に対する技術的異議
- Level 3決定に対する実装可能性の懸念
- プロセス違反・手続き不備の指摘

**プロセス**:

1. **異議申し立て**: GitHub Issueで異議理由・代替案を提示
2. **再検討**: 関連エージェント + PMでの再評価
3. **再協議**: 必要に応じた追加討議・技術検証
4. **再決定**: 修正決定または原決定維持
5. **最終エスカレーション**: 人間判断への移行

#### **デッドロック解決**

**デッドロック条件**:

- エージェント間で合意に至らない
- 技術的判断が分かれる
- 期限内に決定できない

**解決手順**:

1. **PM介入**: プロジェクトマネージャーによる調整・仲裁
2. **技術検証**: 実装実験・プロトタイプでの検証
3. **外部相談**: 人間専門家への相談
4. **強制決定**: PMまたは人間による最終決定

### 継続的改善

#### **プロセス改善**

**定期見直し**:

```yaml
週次:
  - 意思決定の遅延・問題分析
  - プロセス効率の評価
  - 緊急改善の実施

月次:
  - 決定品質の評価
  - エージェント間協調の改善
  - プロセステンプレートの最適化

四半期:
  - 意思決定プロセス全体の見直し
  - レベル分類の調整
  - 新しいパターンの追加
```

**改善メトリクス**:

```yaml
効率性:
  - 決定までの平均時間
  - レビュー完了率
  - エスカレーション率

品質:
  - 決定の実装成功率
  - 後の変更・修正頻度
  - ステークホルダー満足度

透明性:
  - 決定根拠の明確性
  - 影響分析の完全性
  - 記録の網羅性
```

### 関連ドキュメント

- **協調プロトコル**: `/docs/agents/coordination_protocols.md` - エージェント間連携の詳細
- **レビュー通知システム**: `/docs/agents/review_notification_system.md` - 通知・レビュー仕組み
- **緊急時対応**: `/docs/agents/emergency_procedures.md` - 緊急事態での意思決定
- **GitHub運用**: `/docs/development/git_workflow.md` - PR・Issue運用詳細

### 更新履歴

- **v1.0** (2025-08-22): 初版作成 - Claude Code環境での意思決定プロセス定義
- **次回更新予定**: Phase 1完了時（Week 2終了時）- 実運用結果による調整

---

**注意**: 本プロセスはプロジェクト進行中に最適化されます。実際の運用で発見された改善点は速やかに反映し、効率的な意思決定システムを維持します。
