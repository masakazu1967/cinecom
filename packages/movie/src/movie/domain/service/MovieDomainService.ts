import { DuplicateError, NotFoundError } from '@cinecom/shared';
import { Movie } from '../model/Movie';
import { Title } from '../model/Title';
import { MovieExistanceService } from './MovieExistanceService';
import { MovieIdGenerator } from './MovieIdGenerator';
import { MovieRepository } from './MovieRepository';
import { MovieId } from '../model/MovieId';

type CreateMovieRequest = {
  title: Title;
};

type UpdateMovieRequest = {
  id: MovieId;
  title: Title;
};

type RemoveMovieRequest = {
  id: MovieId;
};

export class MovieDomainService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly movieIdGenerator: MovieIdGenerator,
    private readonly movieExistanceService: MovieExistanceService,
  ) {}

  async create(request: CreateMovieRequest): Promise<Movie> {
    const id = await this.movieIdGenerator.generate();
    const { title } = request;
    const movie = Movie.create(id, { title });
    if (await this.movieExistanceService.exists(movie)) {
      throw new DuplicateError('Movie already exists', Movie.ENTITY_NAME);
    }
    await this.movieRepository.save(movie);
    const saved = await this.movieRepository.findById(id);
    if (!saved) {
      throw new NotFoundError('Movie not found', Movie.ENTITY_NAME);
    }
    return saved;
  }

  async update(request: UpdateMovieRequest): Promise<Movie> {
    const { id, title } = request;
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundError('Movie not found', Movie.ENTITY_NAME);
    }
    movie.updateTitle(title);
    if (await this.movieExistanceService.exists(movie)) {
      throw new DuplicateError('Movie already exists', Movie.ENTITY_NAME);
    }
    await this.movieRepository.save(movie);
    const saved = await this.movieRepository.findById(id);
    if (!saved) {
      throw new NotFoundError('Movie not found', Movie.ENTITY_NAME);
    }
    return saved;
  }

  async remove(request: RemoveMovieRequest): Promise<void> {
    const { id } = request;
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundError('Movie not found', Movie.ENTITY_NAME);
    }
    await this.movieRepository.remove(movie.id);
  }
}
