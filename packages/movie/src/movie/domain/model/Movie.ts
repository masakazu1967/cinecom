import { Entity, Version } from '@cinecom/shared';
import { MovieId } from './MovieId';
import { Title } from './Title';

type Props = {
  title: Title;
};

export class Movie extends Entity<MovieId, Props> {
  private constructor(id: MovieId, props: Props, version?: Version) {
    super(id, props, version);
  }

  protected validate(props: Props): void {}

  static create(id: MovieId, props: Props): Movie {
    return new Movie(id, props);
  }

  static restore(id: MovieId, props: Props, version: Version): Movie {
    return new Movie(id, props, version);
  }
}
