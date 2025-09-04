import { TitleBuilder } from './TitleBuilder';

export class TitleFixture extends TitleBuilder {
  private readonly values = [
    'Inception',
    'The Dark Knight',
    'Interstellar',
    'Pulp Fiction',
    'The Shawshank Redemption',
    'The Godfather',
    'The Lord of the Rings: The Return of the King',
    'Forrest Gump',
    'Fight Club',
    'The Matrix',
  ];

  private constructor() {
    super();
    this._value = this.values[0];
  }

  static of(): TitleFixture {
    return new TitleFixture();
  }

  get value(): string {
    return this._value;
  }

  setIndex(index: number): this {
    this._value = this.values[index];
    return this;
  }
}
