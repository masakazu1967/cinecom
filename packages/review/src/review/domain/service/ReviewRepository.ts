import { Review } from '../model/Review';

export interface ReviewRepository {
  findById(id: string): Promise<Review | null>;
  save(review: Review): Promise<void>;
}
