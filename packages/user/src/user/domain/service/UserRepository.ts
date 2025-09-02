import { User } from '../model/User';
import { UserId } from '../model/UserId';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
}
