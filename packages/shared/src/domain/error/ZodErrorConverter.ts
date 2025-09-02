import { ZodError } from 'zod';
import { DomainError } from './DomainError';
import { OutOfRangeError } from './OutOfRangeError';
import { InvalidFormatError } from './InvalidFormatError';

export class ZodErrorConverter {
  static convert(error: ZodError, fieldName: string): DomainError {
    const firstIssue = error.issues[0];
    if (firstIssue.code === 'too_small') {
      return new OutOfRangeError(
        `Value is too small. Minimum is ${firstIssue.minimum}`,
        fieldName,
        firstIssue.input,
        { min: firstIssue.minimum },
      );
    }
    if (firstIssue.code === 'too_big') {
      return new OutOfRangeError(
        `Value is too big. Maximum is ${firstIssue.maximum}`,
        fieldName,
        firstIssue.input,
        { max: firstIssue.maximum },
      );
    }
    if (firstIssue.code === 'invalid_type') {
      return new DomainError(
        `Invalid type. Expected ${firstIssue.expected}`,
        fieldName,
        firstIssue.input,
      );
    }
    if (firstIssue.code === 'invalid_format') {
      return new InvalidFormatError(
        `Invalid format. Expected ${firstIssue.message}`,
        fieldName,
        firstIssue.input,
      );
    }
    return new DomainError(error.message, fieldName);
  }
}
