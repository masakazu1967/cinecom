import { PrimitiveValueObject } from './value-object/PrimitiveValueObject';

export class Version extends PrimitiveValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  protected validate(props: number): void {
    // バージョンは0以上の整数である必要があります
  }

  static create(value: number): Version {
    return new Version(value);
  }
}
