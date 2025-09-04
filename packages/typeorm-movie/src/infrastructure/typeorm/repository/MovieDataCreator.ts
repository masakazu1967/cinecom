import { MovieFixture, MovieToken, type MovieRepository } from '@cinecom/movie';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MovieDataCreator extends MovieFixture {
  constructor(
    @Inject(MovieToken.MovieRepository)
    private readonly movieRepository: MovieRepository,
  ) {
    super();
    this.reset();
  }

  async create(): Promise<void> {
    const movie = this.build();
    await this.movieRepository.save(movie);
    this.reset();
  }
}
