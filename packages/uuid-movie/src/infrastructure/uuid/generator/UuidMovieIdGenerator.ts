import { MovieId, MovieIdGenerator } from '@cinecom/movie';

export class UuidMovieIdGenerator implements MovieIdGenerator {
  generate(): Promise<MovieId> {
    const uuid = crypto.randomUUID();
    return Promise.resolve(MovieId.create(uuid));
  }
}
