import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SceneRecord } from '../entities/SceneRecord';
import { ScenesController } from './ScenesController';
import { ScenesService } from './ScenesService';

@Module({
  imports: [TypeOrmModule.forFeature([SceneRecord])],
  controllers: [ScenesController],
  providers: [ScenesService],
  exports: [ScenesService],
})
export class ScenesModule {}
