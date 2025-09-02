import { PrimitiveValueObject } from '@cinecom/shared';

export class ReviewId extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {}

  static create(value: string): ReviewId {
    return new ReviewId(value);
  }
}
