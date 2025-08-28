# Discord Webhook セキュリティ通知設定ガイド

## 概要

CineComプロジェクトでは、セキュリティスキャンの結果をDiscordチャンネルに自動通知する機能を提供しています。このドキュメントでは、セキュリティベストプラクティスに従った設定方法を説明します。

## 🔧 設定手順

### 1. Discord Webhookの作成

1. **Discordサーバーの準備**
   - セキュリティ通知専用のチャンネルを作成することを推奨
   - チャンネル名例：`#security-alerts`, `#cinecom-security`

2. **Webhookの作成**
   ```
   1. 対象チャンネルで右クリック → 「チャンネルを編集」
   2. 「連携」タブ → 「ウェブフック」
   3. 「新しいウェブフック」をクリック
   4. 名前を設定（例：CineCom Security Monitor）
   5. アバターを設定（オプション）
   6. 「ウェブフックURLをコピー」をクリック
   ```

### 2. GitHub Secrets の設定

⚠️ **重要**: WebhookのURLには秘密情報が含まれているため、必ずGitHub Secretsを使用してください。

1. **GitHub リポジトリでの設定**
   ```
   1. リポジトリページで「Settings」タブを選択
   2. 左サイドバーで「Secrets and variables」→「Actions」を選択
   3. 「New repository secret」をクリック
   4. 以下の情報を入力：
      - Name: DISCORD_SECURITY_WEBHOOK_URL
      - Value: （コピーしたDiscord WebhookのURL）
   5. 「Add secret」をクリック
   ```

### 3. 設定確認

設定が正しく動作するかを確認する方法：

1. **手動テスト**（推奨）
   - セキュリティスキャンを意図的に失敗させる
   - または定期実行（毎日午前2時JST）の結果を待つ

2. **ログ確認**
   - GitHub Actions のログで以下のメッセージを確認
   - 成功：`Discord webhook configured and working`
   - 失敗：`Discord webhook not configured`

## 🔒 セキュリティベストプラクティス

### Webhook URL の管理

- ✅ **DO**: GitHub Secretsを使用してURLを保護
- ✅ **DO**: Webhook URLの定期的な再生成を検討
- ❌ **DON'T**: コード内にWebhook URLを直接記述
- ❌ **DON'T**: 環境変数ファイル（.env）にURLを保存

### アクセス制御

- ✅ **DO**: セキュリティ通知専用チャンネルの作成
- ✅ **DO**: チャンネルへのアクセス権限を適切に設定
- ✅ **DO**: 通知の頻度を制限（現在：mainブランチと定期実行のみ）
- ❌ **DON'T**: パブリックチャンネルでの機密情報通知

### モニタリング

- ✅ **DO**: 通知の到達確認を定期的に実施
- ✅ **DO**: 不要になったWebhookの無効化
- ✅ **DO**: セキュリティ通知の内容を定期的に見直し

## 📊 通知内容の詳細

### 通知トリガー
- セキュリティスキャンが失敗した場合
- 対象：`main`ブランチまたは定期実行
- 実行されるスキャン：
  - CodeQL分析
  - 依存関係脆弱性スキャン
  - シークレット検出
  - ESLintセキュリティルール
  - コンテナセキュリティスキャン

### 通知される情報
- 📍 リポジトリ名
- 🌿 対象ブランチ
- 👤 実行者
- ❌ 失敗したスキャンの種類
- 🔗 詳細確認用のリンク（GitHub Actions & Security タブ）
- ⏰ 実行時刻

### 通知の例
```
🔒 セキュリティアラート - CineCom
セキュリティスキャンで問題が検出されました

🏷️ リポジトリ: user/cinecom
🌿 ブランチ: main
👤 実行者: github-user

❌ 失敗したスキャン:
• 依存関係スキャン
• シークレット検出

🔗 詳細・修正方法:
GitHub Actions で詳細確認
Security タブで脆弱性確認
```

## 🔧 トラブルシューティング

### よくある問題

1. **通知が届かない**
   ```
   原因: GitHub Secretが設定されていない
   解決: DISCORD_SECURITY_WEBHOOK_URL を正しく設定
   ```

2. **Webhook URLが無効**
   ```
   原因: Discord側でWebhookが削除された
   解決: 新しいWebhookを作成し、GitHub Secretを更新
   ```

3. **権限エラー**
   ```
   原因: BotまたはWebhookの権限不足
   解決: Discord チャンネルの権限設定を確認
   ```

### ログの確認方法

1. GitHub Actions の該当ワークフロー実行ページにアクセス
2. `Security Alert Notification` ジョブを展開
3. `Send Discord notification` ステップのログを確認

### テスト方法

安全にテストするための方法：

1. **テスト用ブランチでの実行**
   ```bash
   # feature ブランチを作成してテスト
   git checkout -b feature/test-discord-webhook
   # 何らかの変更をコミットしてプッシュ
   ```

2. **手動実行**
   - GitHub Actions の「Run workflow」ボタンを使用
   - セキュリティスキャンを手動でトリガー

## 📝 更新履歴

- 2025-01-28: 初版作成
- 2025-01-28: 改善された通知フォーマットに更新

## 🆘 サポート

設定に関する問題やご質問がある場合：

1. [Issues](../../issues) でバグ報告
2. [Discussions](../../discussions) で質問投稿
3. セキュリティに関する問題は [Security Advisory](../../security/advisories) へ

---

> ⚠️ **注意**: このドキュメントには機密情報の取り扱いに関する内容が含まれています。設定時はセキュリティベストプラクティスを必ず遵守してください。