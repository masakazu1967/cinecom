import { PrimitiveValueObject } from '@cinecom/shared';

export class Title extends PrimitiveValueObject<string> {
  protected validate(value: string): void {}

  static create(value: string): Title {
    return new Title(value);
  }
}
