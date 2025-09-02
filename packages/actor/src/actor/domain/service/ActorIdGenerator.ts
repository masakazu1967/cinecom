import { ActorId } from '../model/ActorId';

export interface ActorIdGenerator {
  generate(): Promise<ActorId>;
}
