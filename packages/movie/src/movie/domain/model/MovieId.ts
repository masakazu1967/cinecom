import { PrimitiveValueObject, StringIdValidator } from '@cinecom/shared';

export class MovieId extends PrimitiveValueObject<string> {
  static readonly VALUE_OBJECT_NAME = 'MOVIE.ID';
  private constructor(value: string) {
    super(value);
  }

  protected validate(props: string): void {
    StringIdValidator.validate(props, MovieId.VALUE_OBJECT_NAME);
  }

  static create(value: string): MovieId {
    return new MovieId(value);
  }
}
