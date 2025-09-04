import { DomainError } from './DomainError';

export const ValidationErrorCode = {
  INVALID_FORMAT: 'Domain.Validation.InvalidFormat',
  OUT_OF_RANGE: 'Domain.Validation.OutOfRange',
  TYPE_MISMATCH: 'Domain.Validaton.TypeMismatch',
} as const;

export class ValidationError extends DomainError {
  constructor(
    message: string,
    fieldName: string,
    public readonly code: string,
    value?: unknown,
  ) {
    super(message, fieldName, value);
  }
}
