import { ValidationError, ValidationErrorCode } from './ValidationError';

export class OutOfRangeError extends ValidationError {
  public readonly min?: number | bigint;
  public readonly max?: number | bigint;
  constructor(
    message: string,
    fieldName: string,
    value: unknown,
    { min, max }: { min?: number | bigint; max?: number | bigint },
  ) {
    super(message, fieldName, ValidationErrorCode.OUT_OF_RANGE, value);
    this.min = min;
    this.max = max;
  }
}
