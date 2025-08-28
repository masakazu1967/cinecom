#!/bin/bash

# CineCom開発環境セットアップスクリプト

set -e

echo "🎬 CineCom開発環境をセットアップしています..."

# Node.jsバージョン確認
echo "📋 Node.jsバージョンを確認しています..."
if command -v node &> /dev/null; then
    node_version=$(node -v)
    echo "Node.js バージョン: $node_version"
else
    echo "❌ Node.jsがインストールされていません"
    exit 1
fi

# pnpmの確認・インストール
echo "📦 pnpmを確認しています..."
if ! command -v pnpm &> /dev/null; then
    echo "pnpmをインストールしています..."
    npm install -g pnpm
fi

# 依存関係のインストール
echo "📚 依存関係をインストールしています..."
pnpm install

# Dockerの確認
echo "🐳 Dockerを確認しています..."
if ! command -v docker &> /dev/null; then
    echo "❌ Dockerがインストールされていません"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Composeがインストールされていません"
    exit 1
fi

# Dockerサービスの起動
echo "🚀 Dockerサービスを起動しています..."
docker-compose -f docker-compose.dev.yml up -d

# サービスの起動確認
echo "⏳ サービスの起動を待機しています..."
sleep 10

# PostgreSQLの接続確認
echo "🔍 PostgreSQL接続を確認しています..."
for i in {1..30}; do
    if docker exec cinecom-postgres pg_isready -U cinecom > /dev/null 2>&1; then
        echo "✅ PostgreSQLが利用可能です"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQLの起動がタイムアウトしました"
        exit 1
    fi
    sleep 2
done

# Redisの接続確認
echo "🔍 Redis接続を確認しています..."
if docker exec cinecom-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redisが利用可能です"
else
    echo "❌ Redisに接続できません"
    exit 1
fi

echo "🎉 開発環境のセットアップが完了しました！"
echo ""
echo "📖 利用可能なコマンド:"
echo "  pnpm dev          - 開発サーバーを起動"
echo "  pnpm build        - プロダクションビルド"
echo "  pnpm test         - テストを実行"
echo "  pnpm lint         - リントを実行"
echo "  pnpm docker:logs  - Dockerログを表示"
echo "  pnpm docker:down  - Dockerサービスを停止"
echo ""
echo "🌐 サービス一覧:"
echo "  PostgreSQL: localhost:5432 (cinecom/cinecom_dev_password)"
echo "  Redis: localhost:6379"