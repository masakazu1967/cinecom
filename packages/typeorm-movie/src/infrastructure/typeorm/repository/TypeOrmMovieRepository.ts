import { Movie, MovieId, Title, MovieRepository } from '@cinecom/movie';
import { Repository } from 'typeorm';
import { MovieRecord } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Version } from '@cinecom/shared';

export class TypeOrmMovieRepository implements MovieRepository {
  constructor(
    @InjectRepository(MovieRecord)
    private readonly movieRepository: Repository<MovieRecord>,
  ) {}

  findById(id: MovieId): Promise<Movie | null> {
    throw new Error('Method not implemented.');
  }

  findByTitle(title: Title): Promise<Movie | null> {
    throw new Error('Method not implemented.');
  }

  save(movie: Movie): Promise<void> {
    throw new Error('Method not implemented.');
  }

  remove(id: MovieId): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private fromRecord(record: MovieRecord): Movie {
    const id = MovieId.create(record.id);
    const title = Title.create(record.title);
    const version = Version.create(record.version);
    return Movie.restore(id, { title }, version);
  }

  private toRecord(domain: Movie): MovieRecord {
    const record = new MovieRecord();
    domain.notify(record);
    return record;
  }
}
