import { Title } from './Title';

export class TitleFixture {
  private _value: string;
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
    this._value = this.values[0];
  }

  static of(): TitleFixture {
    return new TitleFixture();
  }

  get value(): string {
    return this._value;
  }

  setValue(value: string): this {
    this._value = value;
    return this;
  }

  setIndex(index: number): this {
    this._value = this.values[index];
    return this;
  }

  build(): Title {
    return Title.create(this._value);
  }
}
