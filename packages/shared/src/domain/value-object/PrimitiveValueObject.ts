import { AbstractValueObject } from './AbstractValueObject';

export abstract class PrimitiveValueObject<
  T extends string | number | boolean | bigint,
> extends AbstractValueObject<T> {
  protected constructor(value: T) {
    super(value);
  }

  get value(): T {
    return this.props;
  }
}
