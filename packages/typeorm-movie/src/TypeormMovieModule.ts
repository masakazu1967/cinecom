import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieRecord } from './infrastructure/typeorm/entities';
import { DatabaseConfigModule } from './config/DatabaseConfigModule';
import { MovieToken } from '@cinecom/movie';
import { TypeOrmMovieRepository } from './infrastructure/typeorm/repository/TypeOrmMovieRepository';

@Module({
  imports: [DatabaseConfigModule, TypeOrmModule.forFeature([MovieRecord])],
  providers: [
    {
      provide: MovieToken.MovieRepository,
      useClass: TypeOrmMovieRepository,
    },
  ],
  exports: [TypeOrmModule, MovieToken.MovieRepository],
})
export class TypeOrmMovieModule {}
