import { Version, VersionBuilder } from '@cinecom/shared';
import { MovieIdBuilder } from './MovieIdBuilder';
import { TitleBuilder } from './TitleBuilder';
import { Movie } from './Movie';
import { MovieId } from './MovieId';

export class MovieBuilder {
  protected movieIdBuilder = MovieIdBuilder.of();
  protected titleBuilder = TitleBuilder.of();
  protected versionBuilder?: VersionBuilder;

  static of(): MovieBuilder {
    return new MovieBuilder();
  }

  setMovieIdValue(value: string): this {
    this.movieIdBuilder.setValue(value);
    return this;
  }

  setMovieId(movieId: MovieId): this {
    this.movieIdBuilder.set(movieId);
    return this;
  }

  setTitleValue(value: string): this {
    this.titleBuilder.setValue(value);
    return this;
  }

  setTitle(title: string): this {
    this.titleBuilder.setValue(title);
    return this;
  }

  setVersionValue(value: number): this {
    this.versionBuilder ??= VersionBuilder.of();
    this.versionBuilder.setValue(value);
    return this;
  }

  setVersion(version: Version): this {
    this.versionBuilder ??= VersionBuilder.of();
    this.versionBuilder.set(version);
    return this;
  }

  build(): Movie {
    const movieId = this.movieIdBuilder.build();
    const title = this.titleBuilder.build();
    const version = this.versionBuilder?.build();
    if (!version) {
      return Movie.create(movieId, { title });
    }
    return Movie.restore(movieId, { title }, version);
  }
}
