import { ReviewId } from '../model/ReviewId';

export interface ReviewIdGenerator {
  generate(): Promise<ReviewId>;
}
