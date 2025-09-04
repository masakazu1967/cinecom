import { DomainError } from './DomainError';

export const BusinessRuleErrorCode = {
  DUPLICATE: 'Domain.BusinessRule.Duplicate',
  NOT_FOUND: 'Domain.BusinessRule.NotFound',
} as const;

export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    fieldName: string,
    public readonly code: string,
    value?: unknown,
  ) {
    super(message, fieldName, value);
  }
}
