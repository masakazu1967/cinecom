import { Movie } from '../model/Movie';
import { MovieId } from '../model/MovieId';

export interface MovieRepository {
  findById(id: MovieId): Promise<Movie | null>;
  save(movie: Movie): Promise<void>;
}
