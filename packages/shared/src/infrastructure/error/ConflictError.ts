import {
  InfrastructureError,
  InfrastructureErrorCode,
} from './InfrastructureError';

export class ConflictError extends InfrastructureError {
  constructor(message: string, fieldName: string) {
    super(message, fieldName, InfrastructureErrorCode.CONFLICT);
  }
}
