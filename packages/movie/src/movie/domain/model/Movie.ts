import { Entity, Version } from '@cinecom/shared';
import { MovieId } from './MovieId';
import { Title } from './Title';
import { MovieNotification } from './MovieNotification';

type Props = {
  title: Title;
};

export class Movie extends Entity<MovieId, Props> {
  static readonly ENTITY_NAME = 'MOVIE';

  private constructor(id: MovieId, props: Props, version?: Version) {
    super(id, props, version);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(props: Props): void {
    // No additional validation needed as Title is already validated
  }

  static create(id: MovieId, props: Props): Movie {
    return new Movie(id, props);
  }

  static restore(id: MovieId, props: Props, version: Version): Movie {
    return new Movie(id, props, version);
  }

  get title(): Title {
    return this.props.title;
  }

  updateTitle(title: Title): void {
    this.props.title = title;
  }

  notify(notification: MovieNotification): void {
    notification.setId(this.id);
    notification.setTitle(this.title);
    notification.setVersion(this.version);
  }
}
