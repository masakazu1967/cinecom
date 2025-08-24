# データベーススキーマ設計書テンプレート

## 基本情報

- **プロジェクト名**:
- **データベース名**:
- **DBMSバージョン**: PostgreSQL 15
- **設計者**:
- **作成日**:
- **最終更新**:

## 1. データベース設計概要

### 1.1 設計方針

- 正規化レベル: 第3正規形を基本とし、パフォーマンス要件に応じて非正規化
- 命名規則: snake_case を使用
- 主キー: UUID を基本とし、パフォーマンス要件に応じてSERIALも使用
- 外部キー制約: 参照整合性を保証
- インデックス戦略: 検索頻度とパフォーマンスを考慮

### 1.2 使用する拡張機能

- `uuid-ossp`: UUID生成
- `pg_trgm`: 全文検索
- `pg_stat_statements`: パフォーマンス分析

## 2. ER図

### 2.1 概念ER図

```text
[User] ──< [Review] >── [Movie]
  │                       │
  │                       │
[Profile]              [Genre]
  │                       │
  │                       │
[Watchlist] ────────── [MovieGenre]
```

### 2.2 物理ER図

```text
users (1) ──< (M) reviews (M) >── (1) movies
  │                                   │
  │ (1)                               │ (M)
  │                                   │
profiles                        movie_genres
  │                                   │
  │ (1)                               │ (M)
  │                                   │
watchlists (M) ────────── (1) genres
```

## 3. テーブル定義

### 3.1 ユーザー関連

#### users テーブル

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK | ユーザーID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| password_hash | VARCHAR(255) | NOT NULL | ハッシュ化パスワード |
| role | user_role | DEFAULT 'user' | ユーザー権限 |
| email_verified | BOOLEAN | DEFAULT FALSE | メール認証済み |
| is_active | BOOLEAN | DEFAULT TRUE | アカウント有効状態 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| deleted_at | TIMESTAMP WITH TIME ZONE |  | 論理削除日時 |

**インデックス**:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### profiles テーブル

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    birth_date DATE,
    country VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK | プロフィールID |
| user_id | UUID | FK, NOT NULL | ユーザーID |
| display_name | VARCHAR(100) | NOT NULL | 表示名 |
| bio | TEXT |  | 自己紹介 |
| avatar_url | VARCHAR(500) |  | アバター画像URL |
| birth_date | DATE |  | 生年月日 |
| country | VARCHAR(2) |  | 国コード（ISO 3166-1 alpha-2） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:

```sql
CREATE UNIQUE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
```

### 3.2 映画関連

#### movies テーブル

```sql
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    description TEXT,
    release_date DATE,
    duration INTEGER, -- 分単位
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    trailer_url VARCHAR(500),
    director VARCHAR(255),
    country VARCHAR(2),
    language VARCHAR(5), -- ISO 639-1 + ISO 3166-1
    imdb_id VARCHAR(20),
    tmdb_id INTEGER,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK | 映画ID |
| title | VARCHAR(255) | NOT NULL | 邦題 |
| original_title | VARCHAR(255) |  | 原題 |
| description | TEXT |  | あらすじ |
| release_date | DATE |  | 公開日 |
| duration | INTEGER |  | 上映時間（分） |
| poster_url | VARCHAR(500) |  | ポスター画像URL |
| backdrop_url | VARCHAR(500) |  | 背景画像URL |
| trailer_url | VARCHAR(500) |  | 予告編URL |
| director | VARCHAR(255) |  | 監督名 |
| country | VARCHAR(2) |  | 製作国 |
| language | VARCHAR(5) |  | 言語 |
| imdb_id | VARCHAR(20) |  | IMDB ID |
| tmdb_id | INTEGER |  | TMDB ID |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | 平均評価 |
| rating_count | INTEGER | DEFAULT 0 | 評価件数 |
| view_count | INTEGER | DEFAULT 0 | 閲覧回数 |
| is_published | BOOLEAN | DEFAULT TRUE | 公開状態 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| deleted_at | TIMESTAMP WITH TIME ZONE |  | 論理削除日時 |

**インデックス**:

```sql
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_movies_average_rating ON movies(average_rating);
CREATE INDEX idx_movies_created_at ON movies(created_at);
CREATE UNIQUE INDEX idx_movies_imdb_id ON movies(imdb_id) WHERE imdb_id IS NOT NULL;
CREATE UNIQUE INDEX idx_movies_tmdb_id ON movies(tmdb_id) WHERE tmdb_id IS NOT NULL;
-- 全文検索用インデックス
CREATE INDEX idx_movies_title_gin ON movies USING gin(title gin_trgm_ops);
CREATE INDEX idx_movies_description_gin ON movies USING gin(description gin_trgm_ops);
```

#### genres テーブル

```sql
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- HEXカラーコード
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK | ジャンルID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | ジャンル名 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL用スラッグ |
| description | TEXT |  | ジャンル説明 |
| color | VARCHAR(7) |  | 表示色（HEX） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

#### movie_genres テーブル（中間テーブル）

```sql
CREATE TABLE movie_genres (
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (movie_id, genre_id)
);
```

**インデックス**:

```sql
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);
```

### 3.3 レビュー関連

#### reviews テーブル

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    is_spoiler BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, movie_id) -- ユーザーは1つの映画に1つのレビューのみ
);
```

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | UUID | PK | レビューID |
| user_id | UUID | FK, NOT NULL | ユーザーID |
| movie_id | UUID | FK, NOT NULL | 映画ID |
| rating | INTEGER | NOT NULL, CHECK(1-10) | 評価（1-10点） |
| comment | TEXT |  | レビューコメント |
| is_spoiler | BOOLEAN | DEFAULT FALSE | ネタバレ含有 |
| likes_count | INTEGER | DEFAULT 0 | いいね数 |
| is_published | BOOLEAN | DEFAULT TRUE | 公開状態 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| deleted_at | TIMESTAMP WITH TIME ZONE |  | 論理削除日時 |

**インデックス**:

```sql
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_comment_gin ON reviews USING gin(comment gin_trgm_ops);
```

#### review_likes テーブル

```sql
CREATE TABLE review_likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id)
);
```

### 3.4 ウォッチリスト関連

#### watchlists テーブル

```sql
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### watchlist_movies テーブル（中間テーブル）

```sql
CREATE TABLE watchlist_movies (
    watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (watchlist_id, movie_id)
);
```

## 4. ENUMタイプ定義

### 4.1 ユーザー権限

```sql
CREATE TYPE user_role AS ENUM (
    'user',
    'moderator',
    'admin',
    'super_admin'
);
```

## 5. ビュー定義

### 5.1 映画統計ビュー

```sql
CREATE VIEW movie_stats AS
SELECT
    m.id,
    m.title,
    m.average_rating,
    m.rating_count,
    COUNT(DISTINCT r.id) as review_count,
    COUNT(DISTINCT wm.watchlist_id) as watchlist_count
FROM movies m
LEFT JOIN reviews r ON m.id = r.movie_id AND r.deleted_at IS NULL
LEFT JOIN watchlist_movies wm ON m.id = wm.movie_id
WHERE m.deleted_at IS NULL
GROUP BY m.id, m.title, m.average_rating, m.rating_count;
```

### 5.2 ユーザー統計ビュー

```sql
CREATE VIEW user_stats AS
SELECT
    u.id,
    u.email,
    p.display_name,
    COUNT(DISTINCT r.id) as review_count,
    COUNT(DISTINCT w.id) as watchlist_count,
    AVG(r.rating) as average_rating_given
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN reviews r ON u.id = r.user_id AND r.deleted_at IS NULL
LEFT JOIN watchlists w ON u.id = w.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, p.display_name;
```

## 6. インデックス戦略

### 6.1 複合インデックス

```sql
-- 映画検索用
CREATE INDEX idx_movies_search ON movies(is_published, release_date, average_rating);

-- レビュー検索用
CREATE INDEX idx_reviews_movie_published ON reviews(movie_id, is_published, created_at);

-- ユーザーアクティビティ用
CREATE INDEX idx_reviews_user_created ON reviews(user_id, created_at) WHERE deleted_at IS NULL;
```

### 6.2 部分インデックス

```sql
-- アクティブユーザーのみ
CREATE INDEX idx_users_active ON users(email) WHERE is_active = TRUE AND deleted_at IS NULL;

-- 公開映画のみ
CREATE INDEX idx_movies_published ON movies(created_at) WHERE is_published = TRUE AND deleted_at IS NULL;
```

## 7. トリガー・関数

### 7.1 更新日時自動更新

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 7.2 映画評価自動計算

```sql
CREATE OR REPLACE FUNCTION update_movie_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE movies
    SET
        average_rating = (
            SELECT ROUND(AVG(rating::numeric), 2)
            FROM reviews
            WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id)
            AND deleted_at IS NULL
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id)
            AND deleted_at IS NULL
        )
    WHERE id = COALESCE(NEW.movie_id, OLD.movie_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movie_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_movie_rating();
```

## 8. パフォーマンス最適化

### 8.1 パーティショニング

```sql
-- レビューテーブルの年別パーティション（将来のデータ増加に備えて）
CREATE TABLE reviews_2024 PARTITION OF reviews
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE reviews_2025 PARTITION OF reviews
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 8.2 マテリアライズドビュー

```sql
-- 人気映画ランキング（日次更新）
CREATE MATERIALIZED VIEW popular_movies AS
SELECT
    m.id,
    m.title,
    m.poster_url,
    m.average_rating,
    m.rating_count,
    COUNT(r.id) as recent_reviews
FROM movies m
LEFT JOIN reviews r ON m.id = r.movie_id
    AND r.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND r.deleted_at IS NULL
WHERE m.is_published = TRUE AND m.deleted_at IS NULL
GROUP BY m.id, m.title, m.poster_url, m.average_rating, m.rating_count
ORDER BY
    (m.average_rating * LOG(m.rating_count + 1)) +
    (COUNT(r.id) * 0.1) DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_popular_movies_id ON popular_movies(id);
```

## 9. セキュリティ設定

### 9.1 行レベルセキュリティ（RLS）

```sql
-- ユーザーは自分のプロフィールのみ更新可能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_policy ON profiles
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- ユーザーは自分のレビューのみ更新可能
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_update_policy ON reviews
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY reviews_select_policy ON reviews
    FOR SELECT USING (is_published = TRUE OR user_id = current_setting('app.current_user_id')::uuid);
```

## 10. バックアップ・リストア戦略

### 10.1 バックアップ計画

- **フルバックアップ**: 週1回（日曜深夜）
- **差分バックアップ**: 日1回（深夜2時）
- **トランザクションログ**: 15分間隔
- **保持期間**: 30日間

### 10.2 バックアップコマンド例

```bash
# フルバックアップ
pg_dump -h localhost -U cinecom -d cinecom_prod \
  --format=custom --compress=9 \
  --file=backup_$(date +%Y%m%d_%H%M%S).backup

# テーブル単位のバックアップ
pg_dump -h localhost -U cinecom -d cinecom_prod \
  --table=movies --table=reviews \
  --format=custom --file=movies_reviews_backup.backup
```

---

**データベーススキーマ管理ガイドライン:**

1. マイグレーションファイルですべての変更を管理
2. 本番環境での変更は必ずステージング環境で事前検証
3. インデックス追加は業務時間外に実施
4. 大量データ変更はバッチ処理で分割実行
5. パフォーマンス監視を定期実施
