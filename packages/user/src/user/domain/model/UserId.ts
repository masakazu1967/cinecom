import { PrimitiveValueObject } from '@cinecom/shared';

export class UserId extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {}

  static create(value: string): UserId {
    return new UserId(value);
  }
}
