# 開発向けMCP Server活用ガイド

## 概要

Model Context Protocol (MCP) Serverは、AI開発環境とExternal Tools・Data Sourcesを標準化された方法で連携させるプロトコルです。開発フェーズでは、コード生成・理解・テスト・デバッグの効率を大幅に向上させます。

## 推奨MCP Server一覧

### 必須レベル

#### 1. **mcp-serena**

**概要**: コンテキスト解釈・コード理解の高速化

- 大規模モノレポでのコード検索・解析の効率化
- 複数マイクロサービス間の依存関係可視化
- TypeScript/JavaScript コードベースの高速解析

#### 2. **mcp-postgres**

**概要**: PostgreSQLデータベース管理・操作

- データベーススキーマの管理・クエリ実行
- マイグレーションの作成・実行
- 開発データの投入・確認

#### 3. **mcp-docker**

**概要**: Docker環境管理

- docker-compose.dev.ymlの管理
- コンテナの起動・停止・ログ確認
- 開発環境の一括管理

### 高効率化レベル

#### 4. **mcp-nextjs**

**概要**: Next.js開発支援

- **プロジェクト構造自動生成**: ページ・コンポーネント・レイアウト
- **AI駆動UI生成**: コンテキスト理解による適切なコンポーネント提案
- **認証統合**: OAuth 2.1・Clerk等の認証プロバイダー連携
- **パフォーマンス最適化**: ビルドエラー自動検出・修正提案

#### 5. **mcp-nestjs**

**概要**: NestJS開発支援

- **アーキテクチャ自動構築**: モジュール・コントローラー・サービス生成
- **DI最適化**: 依存性注入の設計支援
- **API開発効率化**: RESTful API・GraphQL統合
- **マイクロサービス特化**: サービス間通信最適化

#### 6. **npm-package-docs-mcp**

**概要**: NPMパッケージドキュメント取得

- 最新README・API仕様の自動取得
- GitHubリポジトリ・NPMパッケージ両対応
- IDE内直接アクセス

#### 7. **mcp-playwright**

**概要**: E2Eテスト自動化

- **AI駆動テスト生成**: 自然言語でのテストケース記述
- **ブラウザ自動化**: 複数ブラウザ対応（Chrome・Firefox・WebKit・Edge）
- **探索型テスト**: AIが自動でサイトを探索しバグ発見
- **リアルユーザーシミュレーション**: 実際のユーザー操作を再現

### 特化機能レベル

#### 8. **mcp-redis**

**概要**: Redis管理・デバッグ

- キャッシュ戦略実装支援
- データ構造の確認・操作
- パフォーマンス分析

#### 9. **mcp-git**

**概要**: Git操作高度化

- ブランチ管理・マージ戦略
- コミット履歴分析
- プルリクエスト最適化

#### 10. **context7**

**概要**: 高度なコンテキスト管理・開発支援

- プロジェクト全体のコンテキスト理解
- 複雑な依存関係の可視化
- 開発フローの最適化
- インテリジェントなコード提案

## 導入方法

### Claude Codeでの基本導入

```bash
# リモートMCPサーバーの追加
claude mcp add --transport http <server-name> <server-url>

# ローカルMCPサーバーの追加
claude mcp add --transport stdio <server-name> <command>

# 設定確認
claude mcp list
```

### 具体的な導入例

#### 0. mcp-serena導入

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project $(pwd)
```

#### 1. mcp-postgres導入

```bash
# PostgreSQL MCP Server追加
claude mcp add --transport stdio postgres "npx @modelcontextprotocol/server-postgres postgresql://cinecom:cinecom_dev_password@localhost:5432/cinecom_dev"
```

#### 2. npm-package-docs-mcp導入

```bash
# NPMパッケージドキュメント取得
npm install -g npm-package-docs-mcp
claude mcp add --transport stdio npm-docs "npm-package-docs-mcp"
```

#### 3. mcp-playwright導入

```bash
# PlaywrightテストMCP Server
npm install -g @playwright/mcp
claude mcp add --transport stdio playwright "playwright-mcp"
```

#### 4. context7導入

```bash
# context7 MCP Server導入
claude mcp add --transport stdio context7 "context7"
```

## 設定方法

### 1. 環境変数設定

```bash
# .env.development
DATABASE_URL="postgresql://cinecom:cinecom_dev_password@localhost:5432/cinecom_dev"
REDIS_URL="redis://localhost:6379"
MCP_SERVER_PORT=3001
```

### 2. プロジェクト固有設定

```json
// .claude/mcp_config.json
{
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres", "$DATABASE_URL"],
      "transport": "stdio"
    },
    "nextjs": {
      "command": "npx",
      "args": ["mcp-nextjs"],
      "transport": "stdio"
    },
    "nestjs": {
      "command": "npx",
      "args": ["mcp-nestjs"],
      "transport": "stdio"
    },
    "context7": {
      "command": "context7",
      "transport": "stdio"
    }
  }
}
```

### 3. Docker統合

```yaml
# docker-compose.dev.yml（追加）
services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    ports:
      - "3001:3001"
    environment:
      - MCP_SERVER_MODE=development
    networks:
      - cinecom-network
```

## 運用の仕方

### 日常的な活用パターン

#### 1. **コード理解・解析**

```text
「このマイクロサービスの認証フローを説明して」
→ mcp-serena + mcp-nestjsが連携して分析
```

#### 2. **新機能実装**

```text
「映画レビュー機能のCRUD APIを作成して」
→ mcp-nestjs + mcp-postgresが自動実装
```

#### 3. **テスト作成**

```text
「ユーザー登録フローのE2Eテストを書いて」
→ mcp-playwrightが自然言語から自動生成
```

#### 4. **デバッグ・調査**

```text
「このエラーの原因を調べて」
→ mcp-postgres + mcp-redisでデータ状態確認
```

### 効率化のベストプラクティス

#### 1. **段階的導入**

1. **mcp-serena** (必須) - 全体理解効率化
2. **mcp-postgres** + **mcp-docker** - 環境管理
3. **mcp-nextjs** + **mcp-nestjs** - 開発効率化
4. **mcp-playwright** - テスト自動化
5. **context7** - 高度なコンテキスト管理

#### 2. **統合活用**

- **フロントエンド開発**: mcp-nextjs + npm-package-docs-mcp + context7
- **バックエンド開発**: mcp-nestjs + mcp-postgres + mcp-redis + context7
- **E2Eテスト**: mcp-playwright + mcp-docker
- **プロジェクト全体管理**: mcp-serena + context7

#### 3. **トラブルシューティング**

- MCP接続エラー → `claude mcp status`で確認
- パフォーマンス問題 → 同時接続MCP数を制限
- 認証エラー → OAuth再認証実行

## プロジェクト固有の活用例

### Cinecom開発での実践例

#### 1. **マイクロサービス連携**

```text
質問: 「user-serviceとmovie-serviceの連携APIを実装して」
回答: mcp-nestjs + mcp-postgresが自動で
- DTOクラス生成
- コントローラー実装
- データベーススキーマ更新
- API仕様書更新
```

#### 2. **フロントエンド開発**

```text
質問: 「映画検索画面のレスポンシブデザインを作成して」
回答: mcp-nextjs + npm-package-docs-mcpが
- Next.js最新機能活用
- TailwindCSS最適化
- TypeScript型安全性確保
```

#### 3. **統合テスト**

```text
質問: 「ユーザーが映画にレビューを投稿する流れをテストして」
回答: mcp-playwrightが
- 自然言語理解
- 自動テストコード生成
- ブラウザ自動実行
- 結果レポート作成
```

## 注意事項・制限

### セキュリティ

- 本番データベースへの直接接続は避ける
- OAuth認証情報の適切な管理
- MCP Serverの権限最小化

### パフォーマンス

- 同時接続MCP Server数の制限（推奨：5個以下）
- 大量データ処理時のタイムアウト設定
- ローカルキャッシュの活用

### 互換性

- Claude Code バージョンとの互換性確認
- MCP Server更新時の動作確認
- 依存パッケージのバージョン管理

---

## 参考リンク

- [Model Context Protocol Official Documentation](https://modelcontextprotocol.io/)
- [Claude Code MCP Integration Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [MCP Server Registry](https://mcp.so/)
