import { PrimitiveValueObject } from '@cinecom/shared';
export class ActorId extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {}

  static create(value: string): ActorId {
    return new ActorId(value);
  }
}
