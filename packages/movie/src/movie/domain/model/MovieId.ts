import { PrimitiveValueObject, StringIdValidator } from '@cinecom/shared';

export class MovieId extends PrimitiveValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  protected validate(props: string): void {
    StringIdValidator.validate(props, 'MovieId');
  }

  static create(value: string): MovieId {
    return new MovieId(value);
  }
}
