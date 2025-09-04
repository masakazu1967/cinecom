import { Title } from './Title';

export class TitleBuilder {
  protected _value: string;

  static of(): TitleBuilder {
    return new TitleBuilder();
  }

  setValue(value: string): this {
    this._value = value;
    return this;
  }

  set(value: Title): this {
    this._value = value.value;
    return this;
  }

  build(): Title {
    return Title.create(this._value);
  }
}
