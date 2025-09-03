import { Version } from '@cinecom/shared';
import { MovieId } from './MovieId';
import { Title } from './Title';

export interface MovieNotification {
  setId(id: MovieId): void;
  setTitle(title: Title): void;
  setVersion(version?: Version): void;
}
