# セキュリティガイドライン

## 基本情報

- **プロジェクト名**: CineCom
- **対象**: セキュリティポリシー・実装ガイドライン
- **作成日**: 2025-08-26
- **最終更新**: 2025-08-26

## 1. セキュリティ基本方針

### 1.1 セキュリティ原則

- **防御の多層化**: 複数のセキュリティ層を設置
- **最小権限の原則**: 必要最小限の権限のみ付与
- **Fail Secure**: 障害時は安全な状態に移行
- **入力検証**: すべての入力データを検証・サニタイゼーション

### 1.2 脅威モデル

```yaml
対象システム: CineCom映画レビューサイト
主な脅威:
  - SQLインジェクション
  - XSS (Cross-Site Scripting)
  - CSRF (Cross-Site Request Forgery)
  - 認証・認可の迂回
  - 機密情報の漏洩
  - DDoS攻撃
  - データベース不正アクセス
```

## 2. 入力検証・サニタイゼーション

### 2.1 入力検証

```typescript
import { IsEmail, IsString, IsOptional, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Length(1, 254, { message: 'Email must be between 1 and 254 characters' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

  @IsString()
  @Length(1, 100, { message: 'Display name must be between 1 and 100 characters' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, { 
    message: 'Display name can only contain letters, numbers, spaces, hyphens, and underscores' 
  })
  displayName: string;
}

// カスタムバリデーター
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// SQL文字列のサニタイゼーション
export const sanitizeSqlInput = (input: string): string => {
  return input.replace(/['"\\;]/g, ''); // 危険な文字を除去
};

// ファイル名のサニタイゼーション
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9\-_\.]/g, '') // 英数字、ハイフン、アンダースコア、ドットのみ許可
    .substring(0, 255); // 長さ制限
};
```

### 2.2 HTMLサニタイゼーション

```typescript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// サーバーサイドでのHTMLサニタイゼーション
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export const sanitizeHtml = (html: string): string => {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    KEEP_CONTENT: true,
  });
};

// レビュー投稿時のサニタイゼーション
export const sanitizeReviewContent = (content: string): string => {
  // HTMLエスケープ
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return escaped.trim().substring(0, 5000); // 長さ制限
};
```

## 3. 認証・認可

### 3.1 パスワード管理

```typescript
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// パスワードハッシュ化（Argon2推奨、bcryptも可）
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // 十分に高いラウンド数
  return bcrypt.hash(password, saltRounds);
};

// パスワード検証
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// 安全なランダム文字列生成
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// パスワード強度チェック
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters required');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  if (password.length >= 12) score += 1;

  return { score, feedback };
};
```

### 3.2 JWT セキュリティ

```typescript
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string; // ユーザーID
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    
    if (!this.secret || this.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }

  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'cinecom',
      audience: 'cinecom-users',
      algorithm: 'HS256',
    });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'cinecom',
        audience: 'cinecom-users',
        algorithms: ['HS256'],
      }) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  generateRefreshToken(): string {
    return generateSecureToken(64);
  }
}
```

### 3.3 セッション管理

```typescript
import session from 'express-session';
import MongoStore from 'connect-mongo';

// セッション設定
export const sessionConfig = {
  secret: process.env.SESSION_SECRET, // 32文字以上の強力なSecret
  name: 'cinecom-session', // デフォルトのconnect.sidを避ける
  resave: false,
  saveUninitialized: false,
  rolling: true, // アクティブ時にセッションを延長
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS必須
    httpOnly: true, // XSS対策
    maxAge: 1000 * 60 * 60 * 2, // 2時間
    sameSite: 'strict' as const, // CSRF対策
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    touchAfter: 24 * 3600, // 24時間ごとにセッション更新
  }),
};

// セッション無効化
export const invalidateSession = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
```

## 4. HTTPS・通信セキュリティ

### 4.1 HTTPS設定

```typescript
// helmet.js設定
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
});

// CORS設定
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 1日
};
```

### 4.2 レート制限

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 一般的なAPI制限
export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:general:',
  }),
  windowMs: 15 * 60 * 1000, // 15分
  max: 1000, // リクエスト/ウィンドウ
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// 認証API制限（より厳しく）
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 最大5回の認証試行
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
});

// レビュー投稿制限
export const reviewLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:review:',
  }),
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // 1時間に10件のレビュー投稿まで
  message: 'Too many reviews posted, please try again later',
});
```

## 5. データ暗号化

### 5.1 機密データの暗号化

```typescript
import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly key: Buffer;

  constructor() {
    const secretKey = process.env.ENCRYPTION_KEY;
    if (!secretKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.key = crypto.scryptSync(secretKey, 'salt', this.keyLength);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('cinecom', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();
    
    // IV + Tag + Encrypted Data を結合
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  }

  decrypt(encryptedText: string): string {
    const ivHex = encryptedText.substr(0, this.ivLength * 2);
    const tagHex = encryptedText.substr(this.ivLength * 2, this.tagLength * 2);
    const encrypted = encryptedText.substr((this.ivLength + this.tagLength) * 2);

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('cinecom', 'utf8'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// 使用例
const encryptionService = new EncryptionService();

// 機密情報の暗号化（例：クレジットカード番号の一部）
const encryptSensitiveData = (data: string): string => {
  return encryptionService.encrypt(data);
};

const decryptSensitiveData = (encryptedData: string): string => {
  return encryptionService.decrypt(encryptedData);
};
```

### 5.2 データベース暗号化

```typescript
// TypeORMトランスフォーマーを使用した自動暗号化
import { ValueTransformer } from 'typeorm';

export class EncryptionTransformer implements ValueTransformer {
  private encryptionService = new EncryptionService();

  to(value: string): string {
    return value ? this.encryptionService.encrypt(value) : value;
  }

  from(value: string): string {
    return value ? this.encryptionService.decrypt(value) : value;
  }
}

// エンティティでの使用
@Entity()
export class User {
  @Column()
  public email: string;

  @Column({ transformer: new EncryptionTransformer() })
  public phoneNumber: string; // 自動的に暗号化/復号化

  @Column()
  public displayName: string;
}
```

## 6. ログ・監査

### 6.1 セキュリティログ

```typescript
import winston from 'winston';

export class SecurityLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: 'logs/security.log',
          level: 'warn' 
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        }),
      ],
    });
  }

  logAuthSuccess(userId: string, ip: string, userAgent: string): void {
    this.logger.info('Authentication successful', {
      event: 'AUTH_SUCCESS',
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  logAuthFailure(email: string, ip: string, userAgent: string, reason: string): void {
    this.logger.warn('Authentication failed', {
      event: 'AUTH_FAILURE',
      email,
      ip,
      userAgent,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  logSuspiciousActivity(userId: string, activity: string, details: any): void {
    this.logger.warn('Suspicious activity detected', {
      event: 'SUSPICIOUS_ACTIVITY',
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logDataAccess(userId: string, resource: string, action: string): void {
    this.logger.info('Data access', {
      event: 'DATA_ACCESS',
      userId,
      resource,
      action,
      timestamp: new Date().toISOString(),
    });
  }

  logSecurityIncident(level: 'low' | 'medium' | 'high', description: string, details: any): void {
    this.logger.error('Security incident', {
      event: 'SECURITY_INCIDENT',
      level,
      description,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

// 使用例
const securityLogger = new SecurityLogger();

// 認証成功
securityLogger.logAuthSuccess('user-123', '192.168.1.1', 'Mozilla/5.0...');

// 認証失敗
securityLogger.logAuthFailure('attacker@evil.com', '192.168.1.100', 'curl/7.0', 'Invalid credentials');

// 怪しい活動
securityLogger.logSuspiciousActivity('user-456', 'Multiple failed login attempts', { 
  attempts: 10, 
  timeWindow: '5 minutes' 
});
```

### 6.2 監査ログ

```typescript
// 監査用デコレーター
export function Audit(resource: string, action: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const userId = this.getCurrentUserId?.() || 'anonymous';
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        
        securityLogger.logDataAccess(userId, resource, action);
        
        return result;
      } catch (error) {
        securityLogger.logSecurityIncident('medium', `Failed ${action} on ${resource}`, {
          userId,
          error: error.message,
          duration: Date.now() - startTime,
        });
        throw error;
      }
    };
  };
}

// 使用例
export class MovieService {
  @Audit('movie', 'create')
  async createMovie(data: CreateMovieDto): Promise<Movie> {
    // 映画作成ロジック
  }

  @Audit('movie', 'delete')
  async deleteMovie(id: string): Promise<void> {
    // 映画削除ロジック
  }
}
```

## 7. セキュリティテスト

### 7.1 脆弱性テスト

```typescript
// セキュリティテスト例
describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      await expect(
        userService.findByEmail(maliciousInput)
      ).rejects.toThrow(ValidationError);
    });

    it('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const result = await reviewService.createReview({
        content: xssPayload,
        movieId: 'movie-1',
        rating: 5,
      });

      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('&lt;script&gt;');
    });
  });

  describe('Authentication', () => {
    it('should enforce rate limiting on login attempts', async () => {
      const loginData = { email: 'test@example.com', password: 'wrong' };
      
      // 5回失敗させる
      for (let i = 0; i < 5; i++) {
        await expect(authService.login(loginData))
          .rejects.toThrow(AuthenticationError);
      }
      
      // 6回目は制限される
      await expect(authService.login(loginData))
        .rejects.toThrow(TooManyAttemptsError);
    });

    it('should expire tokens after specified time', async () => {
      const shortLivedToken = jwtService.generateToken(
        { sub: 'user-1', email: 'test@example.com', roles: ['user'] },
        '1s' // 1秒で期限切れ
      );

      // 2秒待つ
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(() => jwtService.verifyToken(shortLivedToken))
        .toThrow('Invalid or expired token');
    });
  });

  describe('Authorization', () => {
    it('should prevent privilege escalation', async () => {
      const regularUserToken = createTokenForRole('user');
      
      await expect(
        adminService.deleteUser('user-2', regularUserToken)
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
```

## 8. インシデント対応

### 8.1 セキュリティインシデント対応手順

```yaml
インシデント対応プロセス:
  1. 検知・報告:
    - 自動監視システムによる検知
    - ユーザー・スタッフからの報告
    - 第三者からの脆弱性報告

  2. 初期対応:
    - インシデントの確認・分類
    - 影響範囲の特定
    - 緊急度の評価

  3. 封じ込め:
    - 攻撃の停止・遮断
    - システムの分離
    - 証拠の保全

  4. 根本原因分析:
    - ログ分析
    - 脆弱性の特定
    - 攻撃手法の解析

  5. 復旧:
    - システムの修復
    - セキュリティ対策の強化
    - サービスの再開

  6. 事後対応:
    - インシデントレポート作成
    - 再発防止策の実施
    - 関係者への報告
```

### 8.2 緊急連絡体制

```typescript
// インシデント通知システム
export class IncidentNotificationService {
  async notifySecurityIncident(
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    details: any
  ): Promise<void> {
    const notification = {
      timestamp: new Date().toISOString(),
      severity,
      description,
      details,
      system: 'CineCom',
    };

    // ログ記録
    securityLogger.logSecurityIncident(severity, description, details);

    // 緊急度に応じた通知
    switch (severity) {
      case 'critical':
        await this.sendSMSAlert(notification);
        await this.sendEmailAlert(notification);
        await this.sendSlackAlert(notification);
        break;
      
      case 'high':
        await this.sendEmailAlert(notification);
        await this.sendSlackAlert(notification);
        break;
      
      case 'medium':
        await this.sendSlackAlert(notification);
        break;
      
      case 'low':
        // ログのみ
        break;
    }
  }

  private async sendSMSAlert(notification: any): Promise<void> {
    // SMS通知実装
  }

  private async sendEmailAlert(notification: any): Promise<void> {
    // メール通知実装
  }

  private async sendSlackAlert(notification: any): Promise<void> {
    // Slack通知実装
  }
}
```

## 9. 関連ドキュメント

- **コーディング規約**: `/docs/development/coding_standards.md` - セキュアコーディングルール
- **インフラ設定**: `/docs/operations/infrastructure_setup.md` - セキュリティ設定
- **CI/CDパイプライン**: `/docs/development/ci_cd_pipeline.md` - セキュリティスキャン
- **監視システム**: `/docs/operations/monitoring_setup.md` - セキュリティ監視

---

**セキュリティチェックリスト:**

- [ ] 入力検証が全エンドポイントで実装されている
- [ ] パスワードが適切にハッシュ化されている
- [ ] JWTトークンが安全に管理されている
- [ ] HTTPS通信が強制されている
- [ ] レート制限が適切に設定されている
- [ ] 機密データが暗号化されている
- [ ] セキュリティログが記録されている
- [ ] 脆弱性テストが実装されている
- [ ] インシデント対応手順が整備されている
- [ ] セキュリティ監視が稼働している