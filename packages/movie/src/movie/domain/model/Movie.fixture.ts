import { VersionFixture } from '@cinecom/shared';
import { MovieIdFixture } from './MovieId.fixture';
import { TitleFixture } from './Title.fixture';
import { Movie } from './Movie';

export class MovieFixture {
  private readonly movieIdFixture = MovieIdFixture.of();
  private readonly titleFixture = TitleFixture.of();
  private versionFixture?: VersionFixture;

  private constructor() {}

  static of(): MovieFixture {
    return new MovieFixture();
  }

  setMovieIdValue(value: string): this {
    this.movieIdFixture.setValue(value);
    return this;
  }

  setMovieIdIndex(index: number): this {
    this.movieIdFixture.setIndex(index);
    return this;
  }

  setTitleValue(value: string): this {
    this.titleFixture.setValue(value);
    return this;
  }

  setTitleIndex(index: number): this {
    this.titleFixture.setIndex(index);
    return this;
  }

  setVersionValue(value: number): this {
    if (!this.versionFixture) {
      this.versionFixture = VersionFixture.of();
    }
    this.versionFixture.setValue(value);
    return this;
  }

  setIndex(index: number): this {
    this.movieIdFixture.setIndex(index);
    this.titleFixture.setIndex(index);
    return this;
  }

  build(): Movie {
    const movieId = this.movieIdFixture.build();
    const title = this.titleFixture.build();
    const version = this.versionFixture?.build();
    if (!version) {
      return Movie.create(movieId, { title });
    }
    return Movie.restore(movieId, { title }, version);
  }
}
