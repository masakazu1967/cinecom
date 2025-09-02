import z from 'zod';
import { DomainError } from '../error/DomainError';

export class StringIdValidator {
  static validate(value: string, fieldName: string): void {
    const result = z.uuid().safeParse(value);
    if (!result.success) {
      throw new DomainError(`Invalid ${fieldName}`);
    }
  }
}
