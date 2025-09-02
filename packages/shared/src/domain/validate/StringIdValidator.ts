import z from 'zod';
import { InvalidFormatError } from '../error/InvalidFormatError';

export class StringIdValidator {
  static validate(value: string, fieldName: string): void {
    const result = z.uuid().safeParse(value);
    if (!result.success) {
      throw new InvalidFormatError(`Invalid ${fieldName}`, fieldName, value);
    }
  }
}
