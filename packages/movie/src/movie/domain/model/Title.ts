import z from 'zod';
import { PrimitiveValueObject, ZodErrorConverter } from '@cinecom/shared';

export class Title extends PrimitiveValueObject<string> {
  static readonly MIN_LENGTH = 1;
  static readonly MAX_LENGTH = 255;
  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  protected validate(value: string): void {
    const result = z
      .string()
      .min(Title.MIN_LENGTH)
      .max(Title.MAX_LENGTH)
      .safeParse(value);
    if (!result.success) {
      throw ZodErrorConverter.convert(result.error, 'title');
    }
  }

  static create(value: string): Title {
    return new Title(value);
  }
}
