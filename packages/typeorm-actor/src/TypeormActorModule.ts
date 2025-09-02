import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigModule } from './config/DatabaseConfigModule';
import {
  ActorRecord,
  MovieActorRecord,
} from './infrastructure/typeorm/entities';

@Module({
  imports: [
    DatabaseConfigModule,
    TypeOrmModule.forFeature([ActorRecord, MovieActorRecord]),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmActorModule {}
