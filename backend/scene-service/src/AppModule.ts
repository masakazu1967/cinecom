import { TypeOrmSceneModule } from '@cinecom/typeorm-scene';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AppConfig from './config/AppConfig';
import { SceneServiceModule } from './scene/SceneServiceModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [AppConfig],
    }),
    TypeOrmSceneModule,
    SceneServiceModule,
  ],
})
export class AppModule {}
