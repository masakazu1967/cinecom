# インフラ設定

## 基本情報

- **プロジェクト名**: CineCom
- **対象**: インフラ構成・運用設定
- **作成日**: 2025-08-26
- **最終更新**: 2025-08-26

## 1. Exception Filter設定

### 1.1 グローバル例外ハンドリング

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { 
  DomainError, 
  ValidationError, 
  ApplicationError, 
  InfrastructureError, 
  NotFoundError, 
  ConflictError, 
  DatabaseConstraintError 
} from '@/common/errors';

// 各エラー型をHTTPステータスに変換
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let code: string;
    let details: any;

    if (exception instanceof ValidationError) {
      // アプリケーション層の入力検証エラー
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
      details = { field: exception.field };
      
    } else if (exception instanceof DomainError) {
      // ドメイン層のビジネスルール違反
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      code = exception.code || 'DOMAIN_ERROR';
      
    } else if (exception instanceof NotFoundError) {
      // インフラ層のリソース未発見
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      code = 'NOT_FOUND';
      
    } else if (exception instanceof ConflictError) {
      // インフラ層の制約違反
      status = HttpStatus.CONFLICT;
      message = exception.message;
      code = `CONFLICT_${exception.conflictType}`;
      details = { conflictType: exception.conflictType };
      
    } else if (exception instanceof DatabaseConstraintError) {
      // データベース制約違反
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = `CONSTRAINT_${exception.constraintType}`;
      details = { 
        constraintName: exception.constraintName,
        constraintType: exception.constraintType 
      };
      
    } else if (exception instanceof InfrastructureError) {
      // インフラ層の技術的エラー
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INFRASTRUCTURE_ERROR';
      
    } else if (exception instanceof ApplicationError) {
      // アプリケーション層の予期しないエラー
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Application error occurred';
      code = exception.code || 'APPLICATION_ERROR';
      
    } else {
      // その他の予期しないエラー
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'UNKNOWN_ERROR';
    }

    // エラーレスポンスの構築
    const errorResponse = {
      statusCode: status,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 開発環境でのスタックトレース追加
    if (process.env.NODE_ENV === 'development') {
      errorResponse['stack'] = exception instanceof Error ? exception.stack : undefined;
    }

    response.status(status).json(errorResponse);
  }
}
```

### 1.2 アプリケーション設定

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // グローバル例外フィルターの設定
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // グローバルバリデーションパイプの設定
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(3000);
}
bootstrap();
```

### 1.3 モジュール設定

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
```

## 2. データベース設定

### 2.1 TypeORM設定

```typescript
// database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USERNAME'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
```

### 2.2 エラーハンドラー設定

```typescript
// error-handler.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseErrorHandlerService } from './database-error-handler.service';

@Module({
  providers: [
    {
      provide: 'DATABASE_TYPE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('DATABASE_TYPE', 'postgres'),
    },
    DatabaseErrorHandlerService,
  ],
  exports: [DatabaseErrorHandlerService],
})
export class ErrorHandlerModule {}
```

## 3. キャッシュ設定

### 3.1 Redis設定

```typescript
// cache.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
        ttl: 300, // 5分
      }),
    }),
  ],
})
export class CacheModule {}
```

### 3.2 キャッシュサービス

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }
}
```

## 4. 認証・認可設定

### 4.1 JWT設定

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: config.get('JWT_EXPIRES_IN', '1d') 
        },
      }),
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthModule {}
```

### 4.2 ロールベースガード

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY, 
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## 5. ログ設定

### 5.1 カスタムロガー

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private config: ConfigService) {
    this.logger = winston.createLogger({
      level: config.get('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
```

## 6. 環境設定

### 6.1 設定ファイル

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    type: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'cinecom',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
```

### 6.2 環境変数バリデーション

```typescript
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_TYPE: Joi.string().valid('postgres', 'mysql').default('postgres'),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
});
```

## 7. ヘルスチェック

### 7.1 ヘルスチェック設定

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator],
})
export class HealthModule {}

// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }
}
```

## 8. 関連ドキュメント

- **ドメイン設計**: `/docs/architecture/domain_design.md` - ドメイン層・エラーハンドリング
- **デプロイガイド**: `/docs/operations/deployment_guide.md` - デプロイメント設定
- **監視システム**: `/docs/operations/monitoring_setup.md` - システム監視
- **セキュリティガイドライン**: `/docs/security/security_guidelines.md` - セキュリティ設定

---

**インフラ設定チェックリスト:**

- [ ] グローバル例外フィルターが適切に設定されている
- [ ] データベース接続が正しく構成されている  
- [ ] キャッシュシステムが動作している
- [ ] 認証・認可が適切に実装されている
- [ ] ログシステムが設定されている
- [ ] 環境変数バリデーションが実装されている
- [ ] ヘルスチェックエンドポイントが動作している