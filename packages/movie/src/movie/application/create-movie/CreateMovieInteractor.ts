import { MovieDomainService } from '../../domain/service/MovieDomainService';
import { CreateMovieRequest } from './CreateMovieRequest';
import { CreateMovieResponse } from './CreateMovieResponse';
import { CreateMovieUsecase } from './CreateMovieUsecase';

export class CreateMovieInteractor implements CreateMovieUsecase {
  constructor(private readonly movieDomainService: MovieDomainService) {}

  async execute(request: CreateMovieRequest): Promise<CreateMovieResponse> {
    const movie = await this.movieDomainService.create(request);
    return CreateMovieResponse.create(movie);
  }
}
