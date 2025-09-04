import { BusinessRuleError, BusinessRuleErrorCode } from './BusinessRuleError';

export class DuplicateError extends BusinessRuleError {
  constructor(message: string, fieldName: string) {
    super(message, fieldName, BusinessRuleErrorCode.DUPLICATE);
  }
}
