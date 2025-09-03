import { Version } from './Version';

export class VersionFixture {
  private _value?: number;

  private constructor() {}

  static of(): VersionFixture {
    return new VersionFixture();
  }

  get value(): number | undefined {
    return this._value;
  }

  setValue(value: number): this {
    this._value = value;
    return this;
  }

  build(): Version | undefined {
    if (this._value === undefined) {
      return;
    }
    return Version.create(this._value);
  }
}
