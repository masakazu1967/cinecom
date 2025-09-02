import { Actor } from '../model/Actor';
import { ActorId } from '../model/ActorId';

export interface ActorRepository {
  findById(id: ActorId): Promise<Actor | null>;
  save(actor: Actor): Promise<void>;
}
