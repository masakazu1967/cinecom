import { MovieId } from '../model/MovieId';

export interface MovieIdGenerator {
  generate(): Promise<MovieId>;
}
