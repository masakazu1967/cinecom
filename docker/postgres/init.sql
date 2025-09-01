-- PostgreSQL初期化スクリプト
-- データベース: cinecom_dev

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- タイムゾーンの設定
SET timezone = 'Asia/Tokyo';

-- ===========================================
-- MOVIES テーブル
-- ===========================================
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    title_original VARCHAR(255),
    director VARCHAR(100),
    release_year INTEGER,
    genre VARCHAR(50),
    duration_minutes INTEGER,
    description TEXT,
    scene_info_level VARCHAR(20) DEFAULT 'basic', -- basic, intermediate, detailed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_movies_title ON movies USING GIN (title gin_trgm_ops);
CREATE INDEX idx_movies_director ON movies (director);
CREATE INDEX idx_movies_genre ON movies (genre);
CREATE INDEX idx_movies_year ON movies (release_year);

-- ===========================================
-- ACTORS テーブル
-- ===========================================
CREATE TABLE IF NOT EXISTS actors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_original VARCHAR(100),
    birth_date DATE,
    nationality VARCHAR(50),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_actors_name ON actors USING GIN (name gin_trgm_ops);

-- ===========================================
-- MOVIE_ACTORS テーブル（映画-俳優 多対多）
-- ===========================================
CREATE TABLE IF NOT EXISTS movie_actors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    character_name VARCHAR(100),
    role_type VARCHAR(20) DEFAULT 'supporting', -- main, supporting, cameo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id, actor_id)
);

-- インデックス
CREATE INDEX idx_movie_actors_movie ON movie_actors (movie_id);
CREATE INDEX idx_movie_actors_actor ON movie_actors (actor_id);

-- ===========================================
-- SCENES テーブル（L-dialogue 3階層分類対応）
-- ===========================================
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    
    -- 時間情報
    start_time_seconds INTEGER NOT NULL,
    end_time_seconds INTEGER NOT NULL,
    
    -- L-dialogue 3階層分類システム
    level1_classification VARCHAR(10) NOT NULL, -- A, R, C, S, D, L, O
    level2_classification VARCHAR(20) NOT NULL, -- A1, R3, L2 等
    level3_classification TEXT[], -- 複数選択対応: ["A1-1", "A1-3"]
    
    -- シーン基本情報
    scene_title VARCHAR(200),
    scene_description TEXT,
    location VARCHAR(100),
    
    -- 感情・雰囲気タグ
    emotion_tags TEXT[] DEFAULT '{}',
    atmosphere_tags TEXT[] DEFAULT '{}',
    
    -- 台詞情報
    has_dialogue BOOLEAN DEFAULT false,
    memorable_quotes TEXT[],
    
    -- メタデータ
    is_parallel_scene BOOLEAN DEFAULT false,
    parallel_scene_group_id UUID,
    data_entry_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約
    CONSTRAINT chk_time_range CHECK (end_time_seconds > start_time_seconds),
    CONSTRAINT chk_level1 CHECK (level1_classification IN ('A', 'R', 'C', 'S', 'D', 'L', 'O'))
);

-- 時間オーバーラップ検索用GiSTインデックス（100倍高速化）
CREATE INDEX idx_scenes_time_overlap ON scenes 
USING GIST (movie_id, int4range(start_time_seconds, end_time_seconds));

-- 分類検索用インデックス
CREATE INDEX idx_scenes_level1 ON scenes (level1_classification);
CREATE INDEX idx_scenes_level2 ON scenes (level2_classification);
CREATE INDEX idx_scenes_level3 ON scenes USING GIN (level3_classification);

-- 複合インデックス
CREATE INDEX idx_scenes_movie_time ON scenes (movie_id, start_time_seconds);
CREATE INDEX idx_scenes_classification ON scenes (level1_classification, level2_classification);

-- 全文検索用インデックス
CREATE INDEX idx_scenes_description ON scenes USING GIN (scene_description gin_trgm_ops);
CREATE INDEX idx_scenes_tags ON scenes USING GIN (emotion_tags, atmosphere_tags);

-- ===========================================
-- SCENE_ACTORS テーブル（シーン-俳優 多対多）
-- ===========================================
CREATE TABLE IF NOT EXISTS scene_actors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    is_main_actor BOOLEAN DEFAULT false,
    screen_time_seconds INTEGER,
    dialogue_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scene_id, actor_id)
);

-- インデックス
CREATE INDEX idx_scene_actors_scene ON scene_actors (scene_id);
CREATE INDEX idx_scene_actors_actor ON scene_actors (actor_id);
CREATE INDEX idx_scene_actors_main ON scene_actors (is_main_actor);

-- ===========================================
-- PARALLEL_SCENE_GROUPS テーブル（並行シーン管理）
-- ===========================================
CREATE TABLE IF NOT EXISTS parallel_scene_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    group_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- SCENE_DIALOGUES テーブル（台詞詳細管理）
-- ===========================================
CREATE TABLE IF NOT EXISTS scene_dialogues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES actors(id) ON DELETE SET NULL,
    character_name VARCHAR(100),
    dialogue_text TEXT NOT NULL,
    dialogue_order INTEGER NOT NULL,
    is_memorable_quote BOOLEAN DEFAULT false,
    timestamp_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_dialogues_scene ON scene_dialogues (scene_id, dialogue_order);
CREATE INDEX idx_dialogues_actor ON scene_dialogues (actor_id);
CREATE INDEX idx_dialogues_text ON scene_dialogues USING GIN (dialogue_text gin_trgm_ops);

-- ===========================================
-- USERS テーブル（基本ユーザー管理）
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer', -- viewer, contributor, professional, admin
    profile JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- ===========================================
-- UPDATE TRIGGERS（updated_at自動更新）
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガー設定
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_actors_updated_at BEFORE UPDATE ON actors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- サンプルデータ投入
-- ===========================================

-- サンプル映画データ
INSERT INTO movies (title, title_original, director, release_year, genre, duration_minutes, description) VALUES 
('七人の侍', 'Seven Samurai', '黒澤明', 1954, 'Drama', 207, '戦国時代を舞台にした時代劇の傑作'),
('東京物語', 'Tokyo Story', '小津安二郎', 1953, 'Drama', 136, '家族の絆を描いた不朽の名作')
ON CONFLICT DO NOTHING;

-- サンプル俳優データ
INSERT INTO actors (name, name_original, nationality) VALUES 
('三船敏郎', 'Toshiro Mifune', '日本'),
('志村喬', 'Takashi Shimura', '日本'),
('笠智衆', 'Chishu Ryu', '日本'),
('原節子', 'Setsuko Hara', '日本')
ON CONFLICT DO NOTHING;

-- 初期データベースの確認
SELECT current_database(), current_user, version();

-- テーブル作成確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;