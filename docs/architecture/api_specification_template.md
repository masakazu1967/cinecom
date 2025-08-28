# API仕様書テンプレート

## 基本情報

- **プロジェクト名**:
- **API名**:
- **バージョン**: v1.0.0
- **作成者**:
- **作成日**:
- **最終更新**:

## 1. API概要

### 1.1 目的と概要

- **目的**:
- **対象システム**:
- **主要機能**:

### 1.2 API設計原則

- RESTful API設計
- HTTPステータスコードの適切な使用
- 統一されたレスポンス形式
- 適切なエラーハンドリング

## 2. 認証・認可

### 2.1 認証方式

```html
Authorization: Bearer <access_token>
```

### 2.2 認証フロー

```text
1. POST /auth/login → access_token取得
2. リクエストヘッダーにTokenを含める
3. Token有効期限: 1時間
4. Refresh Token有効期限: 30日
```

## 3. 共通仕様

### 3.1 ベースURL

```text
Development: http://localhost:3000/api/v1
Staging: https://staging-api.example.com/api/v1
Production: https://api.example.com/api/v1
```

### 3.2 共通ヘッダー

| ヘッダー名 | 必須 | 説明 | 例 |
|------------|------|------|-----|
| Content-Type | Yes | コンテンツタイプ | application/json |
| Authorization | Conditional | 認証トークン | Bearer eyJ0eXAi... |
| X-Request-ID | No | リクエスト追跡ID | uuid-v4 |

### 3.3 共通レスポンス形式

#### 成功レスポンス

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-v4"
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-v4"
}
```

### 3.4 ページネーション

#### リクエストパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|------------|----|---------|----|
| page | number | 1 | ページ番号 |
| limit | number | 20 | 1ページあたりの件数 |
| sort | string | created_at | ソート項目 |
| order | string | DESC | ソート順序(ASC/DESC) |

#### レスポンス形式

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 4. エンドポイント仕様

### 4.1 認証関連

#### POST /auth/login

**概要**: ユーザーログイン

**リクエスト**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス(200)**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ0eXAi...",
    "refreshToken": "dGhpc2lz...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

**エラー**:

- 400: バリデーションエラー
- 401: 認証情報が正しくない
- 429: レート制限超過

#### POST /auth/refresh

**概要**: アクセストークン更新

**リクエスト**:

```json
{
  "refreshToken": "dGhpc2lz..."
}
```

**レスポンス(200)**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ0eXAi...",
    "expiresIn": 3600
  }
}
```

### 4.2 ユーザー管理

#### GET /users/profile

**概要**: ユーザープロフィール取得

**認証**: 必須

**レスポンス(200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /users/profile

**概要**: ユーザープロフィール更新

**認証**: 必須

**リクエスト**:

```json
{
  "name": "New Name",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**レスポンス(200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "New Name",
    "avatar": "https://example.com/new-avatar.jpg",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.3 映画管理

#### GET /movies

**概要**: 映画一覧取得

**クエリパラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|---|
| genre | string | No | ジャンルフィルター |
| year | number | No | 公開年フィルター |
| rating | number | No | 最低評価フィルター |
| search | string | No | タイトル検索 |

**レスポンス(200)**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Movie Title",
        "description": "Movie description",
        "genre": ["Action", "Drama"],
        "releaseYear": 2024,
        "duration": 120,
        "rating": 8.5,
        "posterUrl": "https://example.com/poster.jpg",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /movies/:id

**概要**: 映画詳細取得

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|-----------|----|----|
| id | UUID | 映画ID |

**レスポンス(200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Movie Title",
    "description": "Movie description",
    "genre": ["Action", "Drama"],
    "releaseYear": 2024,
    "duration": 120,
    "rating": 8.5,
    "posterUrl": "https://example.com/poster.jpg",
    "cast": [
      {
        "id": "uuid",
        "name": "Actor Name",
        "role": "Character Name"
      }
    ],
    "director": "Director Name",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**エラー**:

- 404: 映画が見つからない

#### POST /movies

**概要**: 映画作成

**認証**: 必須（管理者権限）

**リクエスト**:

```json
{
  "title": "New Movie",
  "description": "Movie description",
  "genre": ["Action", "Drama"],
  "releaseYear": 2024,
  "duration": 120,
  "posterUrl": "https://example.com/poster.jpg",
  "director": "Director Name"
}
```

**レスポンス(201)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Movie",
    "description": "Movie description",
    "genre": ["Action", "Drama"],
    "releaseYear": 2024,
    "duration": 120,
    "rating": 0,
    "posterUrl": "https://example.com/poster.jpg",
    "director": "Director Name",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.4 レビュー管理

#### POST /movies/:movieId/reviews

**概要**: 映画レビュー投稿

**認証**: 必須

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|-----------|----|----|
| movieId | UUID | 映画ID |

**リクエスト**:

```json
{
  "rating": 8,
  "comment": "Great movie!",
  "spoiler": false
}
```

**レスポンス(201)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "movieId": "uuid",
    "rating": 8,
    "comment": "Great movie!",
    "spoiler": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 5. エラーコード

### 5.1 HTTPステータスコード

| ステータス | 意味 | 使用場面 |
|-----------|------|----------|
| 200 | OK | 成功 |
| 201 | Created | リソース作成成功 |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | リソースの競合 |
| 422 | Unprocessable Entity | ビジネスロジックエラー |
| 429 | Too Many Requests | レート制限 |
| 500 | Internal Server Error | サーバーエラー |

### 5.2 アプリケーションエラーコード

| エラーコード | HTTPステータス | 説明 |
|-------------|----------------|------|
| VALIDATION_ERROR | 400 | バリデーションエラー |
| AUTHENTICATION_FAILED | 401 | 認証失敗 |
| TOKEN_EXPIRED | 401 | トークン期限切れ |
| INSUFFICIENT_PERMISSIONS | 403 | 権限不足 |
| RESOURCE_NOT_FOUND | 404 | リソースが見つからない |
| DUPLICATE_RESOURCE | 409 | リソースの重複 |
| BUSINESS_LOGIC_ERROR | 422 | ビジネスロジックエラー |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| INTERNAL_ERROR | 500 | 内部サーバーエラー |

## 6. レート制限

### 6.1 制限仕様

| エンドポイント | 制限 | 窓時間 |
|----------------|------|--------|
| /auth/login | 5回 | 15分 |
| /auth/register | 3回 | 1時間 |
| その他認証済み | 1000回 | 1時間 |
| その他未認証 | 100回 | 1時間 |

### 6.2 制限超過時のレスポンス

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "retryAfter": 3600
    }
  }
}
```

## 7. WebSocket API

### 7.1 接続

```javascript
const ws = new WebSocket('wss://api.example.com/ws?token=access_token');
```

### 7.2 メッセージ形式

#### リアルタイム通知

```json
{
  "type": "notification",
  "data": {
    "id": "uuid",
    "message": "New review posted",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 8. SDK・ライブラリ

### 8.1 JavaScript/TypeScript SDK

```typescript
import { CineComAPI } from 'cinecom-sdk';

const api = new CineComAPI({
  baseURL: 'https://api.example.com/api/v1',
  token: 'your-access-token'
});

// 映画一覧取得
const movies = await api.movies.list({
  page: 1,
  limit: 20,
  genre: 'Action'
});
```

## 9. テスト

### 9.1 Postmanコレクション

- Postmanコレクションファイル: `postman/cinecom-api.json`
- 環境ファイル: `postman/environments/`

### 9.2 OpenAPI仕様書

- Swagger UI: `/api/docs`
- OpenAPI仕様書: `/api/docs/openapi.json`

---

**API仕様書メンテナンスガイドライン:**

1. 新機能追加時は仕様書を同時更新
2. 破壊的変更はバージョニングで対応
3. 非推奨APIは段階的廃止計画を明記
4. 実装とドキュメントの整合性を定期確認
