import { DomainError } from './DomainError';

export class OutOfRangeError extends DomainError {
  public readonly min?: number | bigint;
  public readonly max?: number | bigint;
  constructor(
    message: string,
    fieldName: string,
    value: unknown,
    { min, max }: { min?: number | bigint; max?: number | bigint },
  ) {
    super(message, fieldName, value);
    this.min = min;
    this.max = max;
  }
}
