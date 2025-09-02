import { DomainError } from './DomainError';

export class InvalidFormatError extends DomainError {
  constructor(message: string, fieldName: string, value?: unknown) {
    super(message, fieldName, value);
  }
}
