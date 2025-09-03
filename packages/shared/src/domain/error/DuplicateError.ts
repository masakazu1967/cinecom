import { DomainError } from './DomainError';

export class DuplicateError extends DomainError {
  constructor(message: string, fieldName: string) {
    super(message, fieldName);
  }
}
