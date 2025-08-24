# エージェント用Promptテンプレート標準

## 概要

各サブエージェントが受け取る標準的なprompt構造と、Task呼び出し時のベストプラクティスを定義します。

## 基本Prompt構造

### 標準テンプレート

```text
## タスク概要
{task_description}

## 入力情報
{input_resources}

## 期待する成果物
{expected_outputs}

## 作業指針
{work_guidelines}

## 品質基準
{quality_criteria}

## 制約条件
{constraints}
```

## エージェント別Promptテンプレート

### 1. 要求分析エージェント (requirements_analysis)

```text
## タスク概要
{task_description}
例: プロジェクト憲章とステークホルダーヒアリング結果から、Cinecomアプリケーションの要求分析を実施してください。

## 入力情報
- プロジェクト憲章: docs/project/charter.md
- ステークホルダーヒアリング議事録: docs/meetings/stakeholder_interviews/
- {additional_inputs}

## 期待する成果物
- 要求分析書: docs/project/requirements_analysis.md
  - 機能要求の構造化
  - 非機能要求の特定
  - 制約条件の整理
- 課題・懸念事項リスト: docs/project/requirements_issues.md
  - 不明確な要求の特定
  - ステークホルダー間の認識ギャップ
  - 技術的課題の予見

## 作業指針
1. 映画・シーン分類機能を中心とした要求分析
2. マイクロサービス構成を考慮した機能分割
3. MVP範囲の明確化と優先度付け
4. セキュリティ・パフォーマンス要求の詳細化

## 品質基準
- 要求の曖昧性がない明確な記述
- 測定可能な非機能要求
- ステークホルダー承認可能な粒度

## 制約条件
- 12週間開発期間内での実現可能性
- マイクロサービス5サービス構成
- フロントエンド: Next.js, バックエンド: NestJS
```

### 2. 要件定義エージェント (requirements_definition)

```text
## タスク概要
{task_description}
例: 要求分析結果に基づいて、詳細な要件定義とユーザーストーリーを作成してください。

## 入力情報
- 要求分析書: docs/project/requirements_analysis.md
- 課題・懸念事項リスト: docs/project/requirements_issues.md
- {additional_inputs}

## 期待する成果物
- 要件定義書: docs/project/requirements.md
  - 機能要件の詳細仕様
  - 非機能要件の具体的基準
  - システム境界の明確化
- ユーザーストーリー: docs/project/user_stories.md
  - Epic別ユーザーストーリー
  - 受入基準の定義
  - 優先度とストーリーポイント

## 作業指針
1. 要求分析の内容を実装可能な仕様レベルまで詳細化
2. マイクロサービス別の要件整理
3. API境界の初期検討
4. テストシナリオを考慮した仕様定義

## 品質基準
- 開発者が実装判断できる詳細度
- テスト可能な受入基準
- アーキテクト・デザイナーが設計着手できる情報量

## 制約条件
- MVPスコープ内での要件定義
- 既存技術スタック内での実現可能性
- 12週間開発スケジュール考慮
```

### 3. UX/UIデザインエージェント (ux_ui_design)

```text
## タスク概要
{task_description}
例: ユーザーストーリーに基づいて、Cinecomアプリケーションのワイヤーフレームとデザインを作成してください。

## 入力情報
- ユーザーストーリー: docs/project/user_stories.md
- 要件定義書: docs/project/requirements.md
- {additional_inputs}

## 期待する成果物
- ワイヤーフレーム: docs/design/wireframes/
  - 主要画面の画面フロー
  - コンポーネント配置図
  - レスポンシブ対応指針
- デザインガイドライン: docs/design/design_guidelines.md
  - UI/UXコンセプト
  - カラーパレット・タイポグラフィ
  - コンポーネント仕様

## 作業指針
1. 映画・シーン検索を中心としたUX設計
2. マルチデバイス対応の考慮
3. アクセシビリティガイドライン準拠
4. フロントエンド実装を考慮したコンポーネント設計

## 品質基準
- ユーザビリティテスト可能なレベル
- フロントエンドエージェントが実装着手できる詳細度
- レスポンシブ対応の具体的指針

## 制約条件
- Next.js + Tailwind CSS での実装前提
- MVPスコープでの機能絞り込み
- モバイルファースト設計
```

### 4. アーキテクトエージェント (architect)

```text
## タスク概要
{task_description}
例: 要件定義に基づいて、マイクロサービス構成のシステムアーキテクチャとAPI仕様を設計してください。

## 入力情報
- 要件定義書: docs/project/requirements.md
- 技術調査結果: docs/architecture/tech_research.md
- {additional_inputs}

## 期待する成果物
- システムアーキテクチャ: docs/architecture/system_design.md
  - マイクロサービス構成図
  - サービス間通信設計
  - データフロー設計
- API仕様: docs/architecture/api_specification.md
  - RESTful API設計
  - エンドポイント定義
  - データモデル定義

## 作業指針
1. マイクロサービス5サービス構成での最適設計
2. スケーラビリティ・可用性の考慮
3. セキュリティアーキテクチャの組み込み
4. DevOps・監視を考慮した設計

## 品質基準
- バックエンドエージェントが実装着手できる詳細度
- 運用・監視可能なアーキテクチャ
- パフォーマンス要件を満たす設計

## 制約条件
- NestJS + PostgreSQL + Redis構成
- Vercel + Render デプロイ環境
- セキュリティ・コンプライアンス要件
```

### 5. バックエンドエージェント (backend)

```text
## タスク概要
{task_description}
例: システム設計とAPI仕様に基づいて、マイクロサービスのバックエンド実装を行ってください。

## 入力情報
- システムアーキテクチャ: docs/architecture/system_design.md
- API仕様: docs/architecture/api_specification.md
- データベーススキーマ: docs/architecture/database_schema.md
- {additional_inputs}

## 期待する成果物
- バックエンドコード: backend/
  - NestJSアプリケーション実装
  - サービス別モジュール構成
  - API エンドポイント実装
- 開発ドキュメント: backend/README.md
  - セットアップ手順
  - API使用方法
  - テスト実行方法

## 作業指針
1. NestJSベストプラクティスに従った実装
2. TypeScript型安全性の確保
3. エラーハンドリング・ログ出力の標準化
4. テストコードの並行作成

## 品質基準
- ESLint/Prettier準拠コード
- 単体テストカバレッジ80%以上
- API レスポンス時間500ms以内

## 制約条件
- NestJS + TypeORM + PostgreSQL構成
- JWT + OAuth2認証実装
- Docker化対応
```

### 6. フロントエンドエージェント (frontend)

```text
## タスク概要
{task_description}
例: ワイヤーフレームとAPI仕様に基づいて、Cinecomアプリケーションのフロントエンドを実装してください。

## 入力情報
- ワイヤーフレーム: docs/design/wireframes/
- API仕様: docs/architecture/api_specification.md
- デザインガイドライン: docs/design/design_guidelines.md
- {additional_inputs}

## 期待する成果物
- フロントエンドコード: frontend/
  - Next.js アプリケーション実装
  - React コンポーネント
  - API統合
- コンポーネントライブラリ: frontend/components/
  - 再利用可能コンポーネント
  - Storybook対応
  - ドキュメント

## 作業指針
1. Next.js App Router + TypeScript実装
2. Tailwind CSS でのレスポンシブ対応
3. React Hook Form でのフォーム管理
4. SWR/TanStack Queryでの状態管理

## 品質基準
- TypeScript型安全性確保
- コンポーネントテスト実装
- ページロード時間2秒以内
- Lighthouse スコア90以上

## 制約条件
- Next.js 14 + TypeScript構成
- Tailwind CSS + Headless UI
- Vercel デプロイ環境対応
```

### 7. データベースエージェント (database)

```text
## タスク概要
{task_description}
例: システム設計に基づいて、マイクロサービス用のデータベーススキーマを設計してください。

## 入力情報
- システムアーキテクチャ: docs/architecture/system_design.md
- API仕様: docs/architecture/api_specification.md
- DB技術調査: docs/architecture/db_research.md
- {additional_inputs}

## 期待する成果物
- データベーススキーマ: docs/architecture/database_schema.md
  - サービス別DB設計
  - テーブル定義・制約
  - インデックス戦略
- マイグレーションファイル: backend/migrations/
  - TypeORM マイグレーション
  - テストデータ投入
  - ロールバック対応

## 作業指針
1. マイクロサービス別DB分離設計
2. パフォーマンス最適化考慮
3. データ整合性・制約の適切な定義
4. バックアップ・復旧戦略の考慮

## 品質基準
- 正規化された適切なDB設計
- インデックス最適化済み
- 機能要件を満たすクエリパフォーマンス

## 制約条件
- PostgreSQL 15以上
- TypeORM利用前提
- Docker環境での運用
```

### 8. テストエージェント (test)

```text
## タスク概要
{task_description}
例: 実装されたコードに対して、包括的なテストスイートを作成してください。

## 入力情報
- バックエンドコード: backend/
- フロントエンドコード: frontend/
- API仕様: docs/architecture/api_specification.md
- {additional_inputs}

## 期待する成果物
- テストコード: tests/
  - 単体テスト (Jest)
  - 統合テスト (Supertest)
  - E2Eテスト (Playwright)
- テスト戦略: docs/testing/test_strategy.md
  - テストピラミッド構成
  - テストデータ管理
  - CI/CD統合方針

## 作業指針
1. テスト駆動開発(TDD)の実践
2. テストピラミッド構造の実現
3. モック・スタブの適切な利用
4. パフォーマンステストの実装

## 品質基準
- コードカバレッジ80%以上
- 全テスト実行時間10分以内
- CI/CDパイプライン統合済み

## 制約条件
- Jest + Supertest + Playwright構成
- Docker テスト環境
- GitHub Actions統合
```

### 9. セキュリティエージェント (security)

```text
## タスク概要
{task_description}
例: 実装されたシステムに対して、セキュリティ監査と脆弱性対応を実施してください。

## 入力情報
- 実装済みコード: backend/, frontend/
- システムアーキテクチャ: docs/architecture/system_design.md
- セキュリティ要件: docs/project/requirements.md
- {additional_inputs}

## 期待する成果物
- セキュリティ監査レポート: docs/security/audit_report.md
  - 脆弱性assessment結果
  - セキュリティ強化推奨事項
  - コンプライアンス確認
- セキュリティ実装:
  - 認証・認可強化
  - データ暗号化実装
  - セキュリティヘッダー設定

## 作業指針
1. OWASP Top 10対策の実装
2. 認証・認可の多重チェック
3. データ保護・プライバシー対応
4. セキュリティログ・監視の実装

## 品質基準
- 重要な脆弱性ゼロ
- セキュリティベストプラクティス準拠
- 個人情報保護法準拠

## 制約条件
- GDPR・個人情報保護法対応
- JWT + OAuth2認証必須
- HTTPS通信必須
```

### 10. DevOpsエージェント (devops)

```text
## タスク概要
{task_description}
例: 実装されたアプリケーションに対して、CI/CDパイプラインとデプロイ環境を構築してください。

## 入力情報
- 実装済みコード: backend/, frontend/
- システムアーキテクチャ: docs/architecture/system_design.md
- テストスイート: tests/
- {additional_inputs}

## 期待する成果物
- CI/CDパイプライン: .github/workflows/
  - ビルド・テスト・デプロイ自動化
  - マルチ環境対応
  - セキュリティチェック組み込み
- インフラ設定: infrastructure/
  - Docker設定
  - 環境変数管理
  - 監視・ログ設定

## 作業指針
1. GitHub Actions による自動化
2. マイクロサービス別並列ビルド
3. ゼロダウンタイムデプロイ実現
4. 監視・アラートシステム構築

## 品質基準
- デプロイ時間10分以内
- 自動ロールバック機能
- 99.9%可用性目標

## 制約条件
- GitHub Actions + Vercel + Render
- Docker コンテナ化必須
- 環境別設定分離
```

### 11. プロジェクトマネージャーエージェント (project_manager)

```text
## タスク概要
{task_description}
例: プロジェクト全体の進捗管理と品質管理を実施し、次フェーズのタスクを調整してください。

## 入力情報
- 全エージェントの成果物
- プロジェクト憲章: docs/project/charter.md
- 進捗状況: TodoWrite管理状況
- {additional_inputs}

## 期待する成果物
- 進捗レポート: docs/project/progress_report.md
  - フェーズ別達成状況
  - 品質指標測定結果
  - 課題・リスク分析
- 次フェーズ計画:
  - Task発行計画
  - リソース配分調整
  - スケジュール最適化

## 作業指針
1. TodoWrite による全体進捗可視化
2. 複数エージェントへの並列Task発行
3. 品質基準達成の確認・調整
4. 人間レビューが必要な項目の特定

## 品質基準
- プロジェクト進捗90%以上達成率
- エージェント間協調の円滑性
- 課題解決時間24時間以内

## 制約条件
- Claude Code協調システム利用
- 人間承認プロセスの適切な実行
- 12週間プロジェクトスケジュール厳守
```

## Prompt作成ガイドライン

### 1. 明確性の原則

- 曖昧な表現を避け、具体的な指示を記載
- 期待する成果物を明確に定義
- 品質基準を測定可能な形で記載

### 2. 完全性の原則

- 必要な入力情報を漏れなく指定
- 制約条件・前提条件を明確化
- 依存関係のあるタスクとの連携方法を記載

### 3. 一貫性の原則

- 同じエージェントには統一されたprompt構造を使用
- 用語・表記の統一
- 品質基準の共通化

### 4. 実用性の原則

- 実装可能な粒度での指示
- エージェントの専門性に合った内容
- 成果物の後続利用を考慮した形式指定

## 成功基準

- [ ] 全11エージェントのpromptテンプレートが完成
- [ ] エージェント間の一貫性が保持
- [ ] 実際のTask呼び出しで活用可能
- [ ] 品質基準が明確化されている

---

**作成日**: 2025年8月22日
**最終更新**: 2025年8月22日
**目的**: エージェント間協調の標準化とTask品質向上
**対象**: 全プロジェクトメンバー
**次回レビュー**: Task呼び出し仕様書完成時
