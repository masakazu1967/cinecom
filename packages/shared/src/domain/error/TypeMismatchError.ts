import { DomainError } from './DomainError';

export class TypeMismatchError extends DomainError {
  constructor(
    message: string,
    fieldName: string,
    value: unknown,
    public readonly expected: unknown,
  ) {
    super(message, fieldName, value);
  }
}
