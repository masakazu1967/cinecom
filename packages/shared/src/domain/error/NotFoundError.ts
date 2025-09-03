import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  constructor(message: string, fieldName: string) {
    super(message, fieldName);
  }
}
