import { MovieId } from './MovieId';

export class MovieIdBuilder {
  protected _value: string;

  static of(): MovieIdBuilder {
    return new MovieIdBuilder();
  }

  setValue(value: string): this {
    this._value = value;
    return this;
  }

  set(movieId: MovieId): this {
    this._value = movieId.value;
    return this;
  }

  build(): MovieId {
    return MovieId.create(this._value);
  }
}
