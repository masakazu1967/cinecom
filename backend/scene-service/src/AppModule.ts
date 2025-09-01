import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './AppController';
import { AppService } from './AppService';
import * as entities from './entities';
import { ScenesModule } from './scenes/ScenesModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'cinecom'),
        password: configService.get('DATABASE_PASSWORD', 'cinecom_dev_password'),
        database: configService.get('DATABASE_NAME', 'cinecom_dev'),
        entities: Object.values(entities),
        synchronize: false, // 本番では必ずfalse
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    ScenesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
