import z from 'zod';
import { PrimitiveValueObject } from './value-object/PrimitiveValueObject';
import { OutOfRangeError } from './error/OutOfRangeError';

export class Version extends PrimitiveValueObject<number> {
  static readonly MIN = 1;

  private constructor(value: number) {
    super(value);
  }

  protected validate(props: number): void {
    const result = z.number().int().min(Version.MIN).safeParse(props);
    if (!result.success) {
      throw new OutOfRangeError(
        'Version must be an integer greater than or equal to 1',
        'version',
        props,
        { min: Version.MIN },
      );
    }
  }

  static create(value: number): Version {
    return new Version(value);
  }
}
