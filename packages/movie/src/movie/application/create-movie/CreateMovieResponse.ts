import { Movie } from '../../domain/model/Movie';
import { MovieApplicationModel } from '../MovieApplicationModel';

export class CreateMovieResponse {
  private constructor(public readonly movie: MovieApplicationModel) {}

  static create(movie: Movie): CreateMovieResponse {
    const movieApplicationModel = new MovieApplicationModel();
    movie.notify(movieApplicationModel);
    return new CreateMovieResponse(movieApplicationModel);
  }
}
