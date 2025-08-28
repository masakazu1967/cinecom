# Dependabot依存関係管理運用マニュアル

## 1. Dependabotとは

Dependabotは、GitHubの自動依存関係更新サービスです。プロジェクトの依存関係（package.json、Cargo.toml等）を監視し、新しいバージョンが利用可能になると自動的にプルリクエストを作成します。

## 2. PRタイトルの読み方

### 基本フォーマット

```text
build(deps): bump [パッケージ名] from [旧バージョン] to [新バージョン] in [ディレクトリ]
```

### 例

```text
build(deps): bump react-dom from 19.1.0 to 19.1.1 in /frontend
```

- **build(deps)**: 依存関係のビルド関連更新
- **bump**: バージョンアップ
- **react-dom**: 更新対象のパッケージ名
- **19.1.0 → 19.1.1**: パッチバージョン更新（通常はバグフィックス）
- **/frontend**: 更新が行われるディレクトリ

## 3. バージョン更新の種類

### セマンティックバージョニング（MAJOR.MINOR.PATCH）

| 更新タイプ | 例 | 説明 | リスク | 対応優先度 |
|-----------|----|----|------|----------|
| **パッチ** | 19.1.0 → 19.1.1 | バグフィックス | 低 | 高 |
| **マイナー** | 19.1.0 → 19.2.0 | 新機能追加（後方互換性あり） | 中 | 中 |
| **メジャー** | 19.1.0 → 20.0.0 | 破壊的変更 | 高 | 低 |

## 4. Dependabot PR対応フロー

### 4.1 パッチバージョン更新の場合

**リスク**: 低
**推奨対応**: 自動マージ（CI/CD通過後）

```bash
# 1. PRをローカルで確認（オプション）
gh pr checkout [PR番号]

# 2. テストが通ることを確認
npm test  # または pnpm test

# 3. CI/CDが成功していればマージ
gh pr merge [PR番号] --squash
```

### 4.2 マイナーバージョン更新の場合

**リスク**: 中
**推奨対応**: レビュー後マージ

1. **変更ログの確認**
   - GitHub上でPRの詳細を確認
   - パッケージのCHANGELOG/RELEASEノートを確認

2. **ローカルテスト**

   ```bash
   gh pr checkout [PR番号]
   npm install  # または pnpm install
   npm test     # 全テストの実行
   npm run build # ビルドの確認
   ```

3. **問題なければマージ**

   ```bash
   gh pr merge [PR番号] --squash
   ```

### 4.3 メジャーバージョン更新の場合

**リスク**: 高
**推奨対応**: 慎重なレビューと段階的対応

1. **詳細な影響調査**
   - 破壊的変更の内容を確認
   - マイグレーションガイドの確認
   - 既存コードへの影響範囲の調査

2. **開発環境での検証**

   ```bash
   gh pr checkout [PR番号]
   npm install
   # 全機能の動作確認
   npm test
   npm run build
   npm run dev  # 開発サーバーでの動作確認
   ```

3. **段階的対応**
   - 緊急性が低い場合は一旦クローズ
   - 計画的なアップグレード作業として別途スケジュール
   - 必要に応じて開発チームでの相談

## 5. セキュリティ更新の対応

### 識別方法

- PRの説明に「security」の記載がある
- GitHub Security Advisoryへのリンクがある
- CVE番号の記載がある

### 対応

**優先度**: 最高
**対応方法**: 即座に対応

```bash
# セキュリティ更新は即座にマージ
gh pr merge [PR番号] --squash
```

## 6. CI/CDとの連携

### 自動マージの条件

以下の条件を満たす場合、自動マージを検討：

- [ ] パッチバージョン更新である
- [ ] 全てのCI/CDテストが成功している
- [ ] セキュリティスキャンが通過している
- [ ] 依存関係の競合がない

### GitHub Actions設定例

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot Auto Merge
on: pull_request

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - name: Auto-merge patch updates
        if: contains(github.event.pull_request.title, 'patch')
        run: gh pr merge --auto --squash ${{ github.event.pull_request.number }}
```

## 7. トラブルシューティング

### よくある問題と対処法

#### 依存関係の競合

```bash
# package-lock.json の再生成
rm package-lock.json node_modules -rf
npm install

# または pnpm の場合
rm pnpm-lock.yaml node_modules -rf
pnpm install
```

#### テストの失敗

1. ローカルでテストを実行し原因を特定
2. 破壊的変更が原因の場合、コードの修正が必要
3. 修正が困難な場合、PRをクローズし後で対応

#### ビルドエラー

1. 型定義の更新が必要な場合が多い
2. `@types/` パッケージの更新も必要か確認
3. TypeScriptの設定見直しが必要な場合もある

## 8. 監視とレポート

### 週次チェック項目

- [ ] 未対応のDependabot PRの確認
- [ ] セキュリティ関連の更新状況
- [ ] メジャーバージョン更新の計画策定

### 月次レポート項目

- 更新した依存関係の数
- セキュリティ修正の件数
- 対応遅延しているPRの分析

## 9. 緊急時対応

### セキュリティインシデント発生時

1. **即座にセキュリティPRをマージ**
2. **本番環境への緊急デプロイ**
3. **影響範囲の調査と報告**

### 緊急連絡先

- 開発チーム: [Slack #dev-team]
- セキュリティ担当: [Slack #security]
- プロジェクトマネージャー: [連絡先]

## 10. 設定とカスタマイズ

### dependabot.yml設定例

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "team/frontend-reviewers"
```

### 除外設定

特定のパッケージを自動更新から除外する場合：

```yaml
ignore:
  - dependency-name: "package-name"
    versions: ["major"]
```

---

**最終更新**: 2025-08-28
**作成者**: Claude Code Assistant
**承認者**: [Project Manager Name]
