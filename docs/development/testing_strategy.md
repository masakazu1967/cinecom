# テスト戦略書

## 基本情報

- **プロジェクト名**: CineCom
- **作成者**:
- **作成日**:
- **最終更新**:
- **対象バージョン**: v1.0.0

## 1. テスト戦略概要

### 1.1 目的

- 品質の高いソフトウェアの提供
- 回帰バグの防止
- リファクタリングの安全性確保
- 継続的インテグレーションの実現

### 1.2 品質目標

| 項目 | 目標値 | 測定方法 |
|------|--------|----------|
| テストカバレッジ | 80%以上 | Jest Coverage |
| 単体テスト成功率 | 100% | CI/CDパイプライン |
| 統合テスト成功率 | 100% | CI/CDパイプライン |
| E2Eテスト成功率 | 95%以上 | Playwright |

## 2. テストピラミッド

```text
    /\
   /  \     E2E Tests (少)
  /____\
 /      \   Integration Tests (中)
/________\  Unit Tests (多)
```

### 2.1 テスト分類と割合

| テストタイプ | 割合 | 実行頻度 | 責任者 |
|--------------|------|----------|--------|
| 単体テスト | 70% | 各コミット | 開発者 |
| 統合テスト | 20% | 各PR | 開発者 |
| E2Eテスト | 10% | デプロイ前 | QAチーム |

## 3. テストタイプ別詳細

### 3.1 単体テスト (Unit Tests)

#### 3.1.1 対象範囲

- サービスクラスのメソッド
- ユーティリティ関数
- React コンポーネントの個別動作
- API エンドポイントのロジック

#### 3.1.2 テストフレームワーク

**フロントエンド (Next.js)**:

- **メインフレームワーク**: Jest
- **React テスト**: React Testing Library
- **モック**: MSW (Mock Service Worker)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**バックエンド (NestJS)**:

- **メインフレームワーク**: Jest
- **テストユーティリティ**: @nestjs/testing
- **データベースモック**: TypeORM テストユーティリティ

#### 3.1.3 テストパターン例

**サービス層テスト**:

```typescript
// movie.service.spec.ts
describe('MovieService', () => {
  let service: MovieService;
  let repository: MockRepository<Movie>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: createMockRepository()
        }
      ]
    }).compile();

    service = module.get<MovieService>(MovieService);
    repository = module.get(getRepositoryToken(Movie));
  });

  describe('findById', () => {
    it('should return movie when found', async () => {
      // Arrange
      const movieId = 'test-id';
      const expectedMovie = createMockMovie({ id: movieId });
      repository.findOne.mockResolvedValue(expectedMovie);

      // Act
      const result = await service.findById(movieId);

      // Assert
      expect(result).toEqual(expectedMovie);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: movieId }
      });
    });

    it('should throw NotFoundException when movie not found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
```

**React コンポーネントテスト**:

```typescript
// movie-card.component.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MovieCard } from './movie-card.component';

describe('MovieCard', () => {
  const mockMovie = {
    id: '1',
    title: 'Test Movie',
    rating: 8.5,
    posterUrl: '/test-poster.jpg'
  };

  it('should display movie information', () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByAltText('Test Movie poster')).toHaveAttribute(
      'src',
      '/test-poster.jpg'
    );
  });

  it('should call onRate when rating is clicked', () => {
    const onRateMock = jest.fn();
    render(<MovieCard movie={mockMovie} onRate={onRateMock} />);

    const ratingButton = screen.getByRole('button', { name: /rate/i });
    fireEvent.click(ratingButton);

    expect(onRateMock).toHaveBeenCalledWith(mockMovie.id);
  });
});
```

### 3.2 統合テスト (Integration Tests)

#### 3.2.1 対象範囲

- API エンドポイント間の連携
- データベースとの実際の連携
- 外部サービスとの連携（モック使用）
- フロントエンドとバックエンドの連携

#### 3.2.2 テスト環境設定

**バックエンド統合テスト**:

```typescript
// movies.integration.spec.ts
describe('Movies Integration', () => {
  let app: INestApplication;
  let repository: Repository<Movie>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    repository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));

    await app.init();
  });

  beforeEach(async () => {
    await repository.clear(); // テストデータクリア
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /movies', () => {
    it('should return paginated movies', async () => {
      // Arrange
      await repository.save([
        createMockMovie({ title: 'Movie 1' }),
        createMockMovie({ title: 'Movie 2' })
      ]);

      // Act
      const response = await request(app.getHttpServer())
        .get('/movies?page=1&limit=10')
        .expect(200);

      // Assert
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });
  });

  describe('POST /movies', () => {
    it('should create movie with authentication', async () => {
      // Arrange
      const authToken = await getAuthToken('admin@example.com');
      const movieData = {
        title: 'New Movie',
        description: 'A great movie',
        genreIds: []
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movieData)
        .expect(201);

      // Assert
      expect(response.body.data.title).toBe('New Movie');

      const savedMovie = await repository.findOne({
        where: { id: response.body.data.id }
      });
      expect(savedMovie).toBeDefined();
    });
  });
});
```

### 3.3 E2Eテスト (End-to-End Tests)

#### 3.3.1 対象範囲

- ユーザーシナリオベースのテスト
- 画面遷移を含む操作
- 実際のブラウザでの動作確認

#### 3.3.2 テストフレームワーク: Playwright

```typescript
// movies.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Movie Management', () => {
  test.beforeEach(async ({ page }) => {
    // テストデータの準備
    await page.goto('/test-setup');
    await page.click('[data-testid="setup-test-data"]');
  });

  test('should allow user to search and rate movies', async ({ page }) => {
    // メイン画面に移動
    await page.goto('/');

    // 映画検索
    await page.fill('[data-testid="search-input"]', 'インターステラー');
    await page.press('[data-testid="search-input"]', 'Enter');

    // 検索結果の確認
    await expect(page.locator('[data-testid="movie-card"]')).toHaveCount(1);

    // 映画詳細画面に移動
    await page.click('[data-testid="movie-card"]:first-child');
    await expect(page.locator('h1')).toContainText('インターステラー');

    // レーティング機能のテスト
    await page.click('[data-testid="rating-star-8"]');
    await expect(page.locator('[data-testid="rating-display"]')).toContainText('8');

    // 成功メッセージの確認
    await expect(page.locator('[data-testid="rating-success"]')).toBeVisible();
  });

  test('should handle user authentication flow', async ({ page }) => {
    // ログイン画面に移動
    await page.goto('/login');

    // ログイン情報入力
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // ダッシュボードへリダイレクト確認
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // ログアウト
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/');
  });
});
```

## 4. テスト環境

### 4.1 テスト専用データベース

```typescript
// test-db.config.ts
export const testDbConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5433, // 本番とは異なるポート
  database: 'cinecom_test',
  username: 'test_user',
  password: 'test_password',
  entities: ['src/**/*.entity.ts'],
  synchronize: true, // テスト環境のみtrue
  dropSchema: true, // 各テスト前にスキーマをリセット
  logging: false
};
```

### 4.2 テストデータ管理

```typescript
// test-data.factory.ts
export class TestDataFactory {
  static createMovie(overrides?: Partial<Movie>): Movie {
    return {
      id: faker.datatype.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      releaseDate: faker.date.past(),
      duration: faker.datatype.number({ min: 90, max: 180 }),
      rating: faker.datatype.number({ min: 1, max: 10 }),
      ...overrides
    };
  }

  static createUser(overrides?: Partial<User>): User {
    return {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      displayName: faker.name.fullName(),
      role: 'user',
      ...overrides
    };
  }
}

// テストデータシーダー
export class TestDataSeeder {
  static async seedMovies(count: number = 10): Promise<Movie[]> {
    const movies = Array.from({ length: count }, () =>
      TestDataFactory.createMovie()
    );
    return getRepository(Movie).save(movies);
  }
}
```

## 5. モック戦略

### 5.1 外部APIモック

```typescript
// mocks/api.mock.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/external/movie-data/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        id: req.params.id,
        title: 'Mocked Movie',
        description: 'This is a mocked movie',
        rating: 8.5
      })
    );
  }),

  rest.post('/api/external/ratings', (req, res, ctx) => {
    return res(
      ctx.json({ success: true, id: 'rating-123' })
    );
  })
);

// テストセットアップ
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 5.2 データベースモック

```typescript
// mocks/repository.mock.ts
export const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn()
  }))
});

export type MockRepository<T = any> = {
  [K in keyof Repository<T>]: jest.MockedFunction<Repository<T>[K]>;
};
```

## 6. 継続的テスト

### 6.1 GitHub Actions ワークフロー

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: cinecom_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgres://test_user:test_password@localhost:5432/cinecom_test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm playwright install

      - name: Start application
        run: |
          pnpm build
          pnpm start &
          sleep 30

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 6.2 プレコミットフック

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "pnpm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ]
  }
}
```

## 7. テストメトリクス

### 7.1 カバレッジレポート

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### 7.2 品質ゲート

| メトリクス | 基準値 | アクション |
|------------|--------|------------|
| テストカバレッジ | < 80% | PR ブロック |
| テスト実行時間 | > 10分 | 最適化検討 |
| 失敗率 | > 5% | 調査・修正 |
| E2E実行時間 | > 30分 | 並列化検討 |

## 8. テスト実行コマンド

### 8.1 npm scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testMatch='**/*.spec.ts'",
    "test:integration": "jest --testMatch='**/*.integration.spec.ts'",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
  }
}
```

### 8.2 開発環境での実行

```bash
# 監視モードでの開発
pnpm test:watch

# 特定ファイルのテスト
pnpm test movie.service.spec.ts

# カバレッジ付きテスト
pnpm test:coverage

# E2Eテストのデバッグ
pnpm test:e2e:debug
```

## 9. テスト保守

### 9.1 テストの更新タイミング

- 機能追加時: 対応するテストケースを同時作成
- バグ修正時: 再現テストケースを先に作成
- リファクタリング時: テストが継続して通ることを確認

### 9.2 フレイキーテストの対処

```typescript
// リトライ機能付きテスト
test('flaky test with retry', async () => {
  await retry(async () => {
    const result = await unstableOperation();
    expect(result).toBe('expected');
  }, { attempts: 3, delay: 1000 });
});

// 時間に依存しないテスト
test('time-independent test', async () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');
  jest.useFakeTimers().setSystemTime(mockDate);

  const result = await timeBasedOperation();

  expect(result.timestamp).toBe(mockDate.toISOString());

  jest.useRealTimers();
});
```

---

**テスト戦略チェックリスト:**

- [ ] 全テストタイプが適切に設計されている
- [ ] カバレッジ目標が設定されている
- [ ] CI/CDパイプラインが構築されている
- [ ] テストデータ管理が自動化されている
- [ ] モック戦略が明確に定義されている
- [ ] パフォーマンス監視が設定されている
