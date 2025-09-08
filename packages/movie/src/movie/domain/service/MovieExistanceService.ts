import { Inject, Injectable } from '@nestjs/common';
import { Movie } from '../model/Movie';
import type { MovieRepository } from './MovieRepository';
import { MovieToken } from '../../MovieToken';

@Injectable()
export class MovieExistanceService {
  constructor(
    @Inject(MovieToken.MovieRepository)
    private readonly movieRepository: MovieRepository,
  ) {}

  async exists(movie: Movie): Promise<boolean> {
    const existingMovie = await this.movieRepository.findByTitle(movie.title);
    if (!existingMovie) {
      return false;
    }
    return !movie.equals(existingMovie);
  }
}
