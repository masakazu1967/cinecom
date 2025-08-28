-- PostgreSQL初期化スクリプト
-- データベース: cinecom_dev

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- タイムゾーンの設定
SET timezone = 'Asia/Tokyo';

-- 初期データベースの確認
SELECT current_database(), current_user, version();