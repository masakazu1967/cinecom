import { MovieToken } from '@cinecom/movie';
import { Module } from '@nestjs/common';
import { UuidMovieIdGenerator } from './infrastructure/uuid/generator/UuidMovieIdGenerator';

@Module({
  providers: [
    {
      provide: MovieToken.MovieIdGenerator,
      useClass: UuidMovieIdGenerator,
    },
  ],
  exports: [MovieToken.MovieIdGenerator],
})
export class UuidMovieModule {}
