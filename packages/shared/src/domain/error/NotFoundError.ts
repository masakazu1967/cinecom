import { BusinessRuleError, BusinessRuleErrorCode } from './BusinessRuleError';

export class NotFoundError extends BusinessRuleError {
  constructor(message: string, fieldName: string) {
    super(message, fieldName, BusinessRuleErrorCode.NOT_FOUND);
  }
}
