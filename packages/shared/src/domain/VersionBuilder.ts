import { Version } from './Version';

export class VersionBuilder {
  protected _value?: number;

  static of(): VersionBuilder {
    return new VersionBuilder();
  }

  setValue(value: number): this {
    this._value = value;
    return this;
  }

  set(version: Version): this {
    this._value = version.value;
    return this;
  }

  build(): Version | undefined {
    if (this._value === undefined) {
      return;
    }
    return Version.create(this._value);
  }
}
