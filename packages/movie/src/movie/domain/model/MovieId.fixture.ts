import { MovieIdBuilder } from './MovieIdBuilder';

export class MovieIdFixture extends MovieIdBuilder {
  private readonly values = [
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440009',
  ];

  protected constructor() {
    super();
    this._value = this.values[0];
  }

  static of(): MovieIdFixture {
    return new MovieIdFixture();
  }

  get value(): string {
    return this._value;
  }

  setIndex(index: number): this {
    this._value = this.values[index];
    return this;
  }
}
