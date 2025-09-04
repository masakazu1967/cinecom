import { VersionBuilder } from './VersionBuilder';

export class VersionFixture extends VersionBuilder {
  protected constructor() {
    super();
  }

  static of(): VersionFixture {
    return new VersionFixture();
  }

  get value(): number | undefined {
    return this._value;
  }
}
