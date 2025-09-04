import { DuplicateError, NotFoundError } from '@cinecom/shared';
import { Movie } from '../model/Movie';
import { Title } from '../model/Title';
import { MovieExistanceService } from './MovieExistanceService';
import { type MovieIdGenerator } from './MovieIdGenerator';
import { type MovieRepository } from './MovieRepository';
import { MovieId } from '../model/MovieId';
import { Inject, Injectable } from '@nestjs/common';

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

@Injectable()
export class MovieDomainService {
  constructor(
    @Inject('MovieRepository')
    private readonly movieRepository: MovieRepository,
    @Inject('MovieIdGenerator')
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
