import { MovieIdFixture } from './MovieId.fixture';
import { TitleFixture } from './Title.fixture';
import { MovieBuilder } from './MovieBuilder';

export class MovieFixture extends MovieBuilder {
  protected constructor() {
    super();
  }

  static of(): MovieFixture {
    const fixture = new MovieFixture();
    fixture.reset();
    return fixture;
  }

  reset(): this {
    this.movieIdBuilder = MovieIdFixture.of();
    this.titleBuilder = TitleFixture.of();
    this.versionBuilder = undefined;
    return this;
  }

  isMovieIdFixture(fixture: unknown): fixture is MovieIdFixture {
    return fixture instanceof MovieIdFixture;
  }

  isTitleFixture(fixture: unknown): fixture is TitleFixture {
    return fixture instanceof TitleFixture;
  }

  setMovieIdIndex(index: number): this {
    if (this.isMovieIdFixture(this.movieIdBuilder)) {
      this.movieIdBuilder.setIndex(index);
    }
    return this;
  }

  setTitleIndex(index: number): this {
    if (this.isTitleFixture(this.titleBuilder)) {
      this.titleBuilder.setIndex(index);
    }
    return this;
  }

  setIndex(index: number): this {
    this.setMovieIdIndex(index);
    this.setTitleIndex(index);
    return this;
  }
}
