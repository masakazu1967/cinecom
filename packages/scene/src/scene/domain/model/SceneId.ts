import { PrimitiveValueObject } from '@cinecom/shared';

export class SceneId extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {}

  static create(value: string): SceneId {
    return new SceneId(value);
  }
}
