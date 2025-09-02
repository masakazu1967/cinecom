import { UserId } from '../model/UserId';

export interface UserIdGenerator {
  generate(): Promise<UserId>;
}
