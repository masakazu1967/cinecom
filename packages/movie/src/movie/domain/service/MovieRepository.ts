import { Movie } from '../model/Movie';
import { MovieId } from '../model/MovieId';
import { Title } from '../model/Title';

export interface MovieRepository {
  findById(id: MovieId): Promise<Movie | null>;
  findByTitle(title: Title): Promise<Movie | null>;
  save(movie: Movie): Promise<void>;
  remove(id: MovieId): Promise<void>;
}
