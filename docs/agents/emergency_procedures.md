# 緊急時対応プロトコル

## Cinecom プロジェクト - エージェント協調システム

### 概要

本ドキュメントは、Cinecomプロジェクトにおける緊急事態発生時の対応プロトコルを定義します。システム障害、エージェント障害、マイクロサービス障害等への迅速かつ効果的な対応手順を詳述します。

### 緊急事態の分類

#### **重要度レベル**

**Critical (重大)**:

- システム全体の停止・重大機能不全
- データ損失・セキュリティ侵害
- 複数サービスの同時障害
- **対応時間**: 即座（30分以内）

**High (高)**:

- 単一サービスの停止・機能不全
- パフォーマンス大幅劣化
- 開発ブロッカーの発生
- **対応時間**: 4時間以内

**Medium (中)**:

- 軽微な機能不全・パフォーマンス問題
- 一時的な接続問題
- 非クリティカルな設定問題
- **対応時間**: 24時間以内

**Low (低)**:

- 文書化・報告の遅延
- 軽微な品質問題
- **対応時間**: 週次レビューで対応

### エージェント障害時の対応

#### **エージェント応答停止**

**検出方法**:

```yaml
自動検出:
  - 24時間以上のTask応答なし
  - エラーレスポンスの継続
  - 異常な動作パターンの検出

手動検出:
  - 他エージェントからの報告
  - PMによる定期ヘルスチェック
  - 人間による異常発見
```

**対応手順**:

```bash
# 1. 状態確認
./scripts/check_agent_health.sh [agent_name]

# 2. 復旧試行
./scripts/recover_agent.sh [agent_name]

# 3. 緊急通知
./scripts/emergency_notify.sh "Agent failure: [agent_name]" "critical"

# 4. 代替手段起動
./scripts/activate_backup_agent.sh [agent_name]
```

**復旧プロセス**:

1. **即座対応** (5分以内):
   - Discord #cinecom-urgent への緊急通知
   - PMによる状況把握・影響評価
   - 自動復旧スクリプト実行

2. **短期対応** (30分以内):
   - 手動復旧試行
   - 作業の他エージェントへの一時移管
   - 人間への状況報告

3. **中期対応** (4時間以内):
   - 根本原因分析
   - 代替手段での作業継続
   - 復旧計画の策定

4. **長期対応** (24時間以内):
   - 完全復旧または代替システム確立
   - 再発防止策の実装
   - 事後検証・改善

#### **エージェント作業品質低下**

**検出指標**:

```yaml
品質問題:
  - テスト失敗率の急激な増加
  - コードレビューでの指摘増加
  - 要件との不一致

パフォーマンス問題:
  - 作業完了時間の大幅増加
  - 繰り返し修正の発生
  - 他エージェントからの相談増加
```

**対応手順**:

1. **品質問題の特定**: 具体的な問題点・原因の分析
2. **作業方針調整**: Task指示の詳細化・明確化
3. **他エージェント支援**: 技術相談・協調作業の強化
4. **人間介入**: 必要に応じた専門家による支援

### 協調システム障害時の対応

#### **Claude Code TodoWrite + Task システム障害**

**症状**:

- TodoWrite更新不能
- Task実行エラー継続
- エージェント間通信断絶

**緊急対応**:

```bash
# 1. バックアップシステム起動
./scripts/activate_backup_coordination.sh

# 2. GitHub Issue/PRベースの協調に切り替え
./scripts/switch_to_github_coordination.sh

# 3. Discord緊急チャンネルでの手動協調
./scripts/setup_emergency_discord.sh
```

**バックアップ協調システム**:

```yaml
GitHub Issue/PR ベース:
  進捗管理: GitHub Project Boards
  Task分散: Issue Assignment + Label管理
  コミュニケーション: Issue Comments + PR Reviews

Discord 手動協調:
  チャンネル: "#cinecom-emergency-coord"
  進捗報告: 定時報告（3時間毎）
  Task依頼: 直接メンション + 確認応答

最小限の手動協調:
  PM指示: 直接的なTask指示
  完了報告: 簡潔な結果報告
  課題エスカレーション: 即座の人間通知
```

#### **GitHub システム障害**

**対応手順**:

1. **即座通知**: Discord経由での全エージェント通知
2. **ローカル作業継続**: Git操作・ファイル編集の継続
3. **進捗記録**: ローカルファイルでの進捗管理
4. **復旧後同期**: GitHub復旧後の変更同期

**バックアップ記録システム**:

```bash
# ローカル進捗記録
echo "$(date): [agent_name] [task_status] [description]" >> .local/progress.log

# 変更記録
git log --oneline --since="today" > .local/daily_changes.log

# 課題記録
echo "[timestamp] [severity] [description] [action_taken]" >> .local/issues.log
```

### マイクロサービス障害時の対応

#### **単一サービス障害**

**即座対応** (15分以内):

```bash
# 1. 障害サービス特定
./scripts/identify_failed_service.sh

# 2. ヘルスチェック実行
./scripts/health_check.sh [service_name]

# 3. 自動復旧試行
./scripts/auto_recover_service.sh [service_name]

# 4. 影響範囲確認
./scripts/check_service_dependencies.sh [service_name]
```

**サービス分離対応**:

```yaml
user-service 障害:
  影響: 認証・ユーザー管理機能停止
  対応: 
    - 他サービスのゲストモード起動
    - 認証バイパス（開発環境のみ）
    - ユーザーデータキャッシュからの復旧

movie-service 障害:
  影響: 映画データ検索・表示停止
  対応:
    - 静的データからの代替表示
    - 他サービスとの連携停止
    - データ同期の一時停止

actor-service 障害:
  影響: 俳優データ・キャスト情報停止
  対応:
    - 映画サービスでの簡易表示
    - 関連機能の一時無効化

scene-service 障害:
  影響: シーン検索・管理機能停止
  対応:
    - 基本的な映画検索のみ継続
    - シーン関連UI の一時非表示

review-service 障害:
  影響: レビュー・評価機能停止
  対応:
    - 読み取り専用モード
    - 既存データの表示継続
```

**データ整合性確保**:

```bash
# データ整合性チェック
./scripts/check_data_consistency.sh

# バックアップからの復旧
./scripts/restore_from_backup.sh [service_name] [timestamp]

# データ同期修復
./scripts/repair_data_sync.sh [service_name]
```

#### **複数サービス同時障害**

**緊急事態宣言**:

1. **Critical レベル緊急事態の宣言**
2. **全エージェントへの緊急召集**
3. **人間への即座エスカレーション**
4. **開発作業の一時停止**

**復旧戦略**:

```yaml
優先順位付き復旧:
  1. user-service: 認証基盤の復旧
  2. movie-service: 主要機能の復旧  
  3. actor-service, scene-service: 関連機能の復旧
  4. review-service: 追加機能の復旧

段階的復旧:
  Phase 1: 最小限機能での サービス起動
  Phase 2: 基本機能の段階的復旧
  Phase 3: 全機能の復旧・検証
  Phase 4: データ整合性の確認・修復
```

### 通信・ネットワーク障害

#### **Discord 障害**

**代替通信手段**:

```yaml
GitHub:
  - Issue/PR Comments
  - GitHub Discussions
  - Commit Messages

メール:
  - 緊急時連絡先への一斉メール
  - 重要決定事項の文書化

ローカルファイル:
  - .agents/emergency/communications.md
  - 共有ディレクトリでのメッセージ交換
```

#### **インターネット接続障害**

**オフライン作業継続**:

```bash
# ローカル環境での開発継続
./scripts/setup_offline_environment.sh

# ローカルデータベースでのテスト
./scripts/start_local_services.sh

# 変更履歴のローカル記録
./scripts/log_offline_changes.sh
```

### データ保護・復旧

#### **データバックアップ**

**定期バックアップ**:

```bash
# データベースバックアップ (毎日)
./scripts/backup_databases.sh

# ファイルシステムバックアップ (毎日)
./scripts/backup_files.sh

# 設定・スクリプトバックアップ (毎週)
./scripts/backup_configs.sh
```

**緊急バックアップ**:

```bash
# 即座の全システムバックアップ
./scripts/emergency_full_backup.sh

# 重要データの優先バックアップ
./scripts/priority_backup.sh
```

#### **データ復旧**

**復旧手順**:

```bash
# 1. データ損失範囲の特定
./scripts/assess_data_loss.sh

# 2. 最新バックアップからの復旧
./scripts/restore_from_latest_backup.sh

# 3. データ整合性チェック
./scripts/verify_data_integrity.sh

# 4. サービス再起動・動作確認
./scripts/restart_and_verify.sh
```

### 緊急時コミュニケーション

#### **エスカレーション体制**

```yaml
Level 1 - Agent → PM:
  方法: Task経由での報告
  対応: PMによる初期対応・影響評価

Level 2 - PM → 関連エージェント:
  方法: 緊急Task発行 + Discord通知
  対応: 関連エージェントによる協調対応

Level 3 - PM → 人間:
  方法: Discord #cinecom-urgent + メール
  対応: 人間による判断・指示

Level 4 - 人間 → 外部:
  方法: 電話・メール・専門業者
  対応: 外部リソースによる支援
```

#### **緊急時報告フォーマット**

```yaml
即座報告 (5分以内):
  - 障害発生時刻
  - 障害の概要・症状
  - 影響範囲（推定）
  - 実施した緊急対応

詳細報告 (30分以内):
  - 根本原因分析
  - 完全な影響範囲
  - 復旧計画・所要時間
  - 必要なリソース・支援

最終報告 (復旧後24時間以内):
  - 復旧経緯・所要時間
  - 根本原因・再発防止策
  - 学習事項・改善提案
  - プロセス・ツールの見直し
```

### 復旧後手順

#### **システム検証**

```bash
# 全サービス動作確認
./scripts/full_system_health_check.sh

# データ整合性確認
./scripts/comprehensive_data_check.sh

# パフォーマンステスト
./scripts/performance_verification.sh

# セキュリティ検証
./scripts/security_audit.sh
```

#### **事後分析**

**分析項目**:

```yaml
原因分析:
  - 根本原因の特定
  - 寄与要因の分析
  - 予防可能性の評価

対応評価:
  - 検出時間・初期対応の適切性
  - エスカレーション・意思決定の迅速性
  - 復旧手順・時間の妥当性

改善計画:
  - 再発防止策の具体化
  - 検出・対応能力の強化
  - ツール・プロセスの改善
```

#### **改善実装**

```bash
# 監視・アラートの強化
./scripts/enhance_monitoring.sh

# 自動復旧機能の追加
./scripts/implement_auto_recovery.sh

# バックアップ戦略の見直し
./scripts/improve_backup_strategy.sh

# 文書・手順の更新
./scripts/update_procedures.sh
```

### 緊急時訓練

#### **定期訓練**

**月次訓練**:

```yaml
シナリオ:
  - 単一サービス障害対応
  - エージェント障害対応
  - 通信障害対応

評価項目:
  - 検出・報告の迅速性
  - 対応手順の遵守
  - 協調・コミュニケーション

改善:
  - 手順・ツールの最適化
  - 訓練結果の振り返り
```

**四半期訓練**:

```yaml
大規模シナリオ:
  - 複数サービス同時障害
  - インフラ全体障害
  - 長期間障害

総合評価:
  - 緊急時組織運営
  - 意思決定プロセス
  - ステークホルダー連携
```

### 関連ドキュメント

- **協調プロトコル**: `/docs/agents/coordination_protocols.md` - 通常時の協調手順
- **監視・メトリクス**: `/docs/operations/monitoring_metrics.md` - システム監視詳細
- **バックアップ戦略**: `/docs/operations/backup_strategy.md` - データ保護詳細
- **インフラ運用**: `/docs/operations/deployment_guide.md` - システム運用詳細

### 更新履歴

- **v1.0** (2025-08-22): 初版作成 - 基本的な緊急時対応プロトコル
- **次回更新予定**: Phase 1完了時（Week 2終了時）- 実環境での検証結果反映

---

**重要**: 緊急時対応は迅速性が最重要です。完璧を求めず、段階的な対応で被害を最小限に抑制し、その後に根本的な改善を図ります。
