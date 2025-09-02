import { Entity, Version } from '@cinecom/shared';
import { ReviewId } from './ReviewId';

type Props = {};

export class Review extends Entity<ReviewId, Props> {
  private constructor(id: ReviewId, props: Props, version?: Version) {
    super(id, props, version);
  }

  protected validate(props: Props): void {}

  static create(id: ReviewId, props: Props): Review {
    return new Review(id, props);
  }

  static restore(id: ReviewId, props: Props, version: Version): Review {
    return new Review(id, props, version);
  }
}
