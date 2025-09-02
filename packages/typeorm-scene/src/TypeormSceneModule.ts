import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigModule } from './config/DatabaseConfigModule';
import {
  ParallelSceneGroupRecord,
  SceneActorRecord,
  SceneDialogueRecord,
  SceneRecord,
} from './infrastructure/typeorm/entities';

@Module({
  imports: [
    DatabaseConfigModule,
    TypeOrmModule.forFeature([
      SceneRecord,
      SceneActorRecord,
      SceneDialogueRecord,
      ParallelSceneGroupRecord,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmSceneModule {}
