import { CreateMovieRequest } from './CreateMovieRequest';
import { CreateMovieResponse } from './CreateMovieResponse';

export interface CreateMovieUsecase {
  execute(request: CreateMovieRequest): Promise<CreateMovieResponse>;
}
