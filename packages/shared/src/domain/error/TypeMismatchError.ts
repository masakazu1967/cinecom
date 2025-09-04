import { ValidationError, ValidationErrorCode } from './ValidationError';

export class TypeMismatchError extends ValidationError {
  constructor(
    message: string,
    fieldName: string,
    value: unknown,
    public readonly expected: unknown,
  ) {
    super(message, fieldName, ValidationErrorCode.TYPE_MISMATCH, value);
  }
}
