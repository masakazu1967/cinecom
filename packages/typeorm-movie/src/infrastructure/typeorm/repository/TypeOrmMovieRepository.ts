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

  async findById(id: MovieId): Promise<Movie | null> {
    const record = await this.movieRepository.findOneBy({ id: id.value });
    if (!record) {
      return null;
    }
    return this.fromRecord(record);
  }

  async findByTitle(title: Title): Promise<Movie | null> {
    const record = await this.movieRepository.findOneBy({ title: title.value });
    if (!record) {
      return null;
    }
    return this.fromRecord(record);
  }

  async save(movie: Movie): Promise<void> {
    const record = this.toRecord(movie);
    await this.movieRepository.save(record);
  }

  async remove(id: MovieId): Promise<void> {
    await this.movieRepository.delete({ id: id.value });
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
