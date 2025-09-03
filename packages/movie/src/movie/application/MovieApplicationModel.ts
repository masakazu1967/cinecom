import { Version } from '@cinecom/shared';
import { MovieId } from '../domain/model/MovieId';
import { MovieNotification } from '../domain/model/MovieNotification';
import { Title } from '../domain/model/Title';

export class MovieApplicationModel implements MovieNotification {
  id: string;
  title: string;
  version?: number;

  setId(id: MovieId): void {
    this.id = id.value;
  }

  setTitle(title: Title): void {
    this.title = title.value;
  }

  setVersion(version?: Version): void {
    this.version = version?.value;
  }
}
