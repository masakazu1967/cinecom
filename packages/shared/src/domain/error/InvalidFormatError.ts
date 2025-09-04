import { ValidationError, ValidationErrorCode } from './ValidationError';

export class InvalidFormatError extends ValidationError {
  constructor(message: string, fieldName: string, value?: unknown) {
    super(message, fieldName, ValidationErrorCode.INVALID_FORMAT, value);
  }
}
