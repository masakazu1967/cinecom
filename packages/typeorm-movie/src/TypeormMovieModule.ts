import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieRecord } from './infrastructure/typeorm/entities';
import { DatabaseConfigModule } from './config/DatabaseConfigModule';

@Module({
  imports: [DatabaseConfigModule, TypeOrmModule.forFeature([MovieRecord])],
  exports: [TypeOrmModule],
})
export class TypeOrmMovieModule {}
