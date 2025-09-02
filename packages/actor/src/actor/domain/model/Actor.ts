import { Entity } from '@cinecom/shared';
import { ActorId } from './ActorId';

type Props = {};

export class Actor extends Entity<ActorId, Props> {
  private constructor(id: ActorId, props: Props) {
    super(id, props);
  }

  protected validate(props: Props): void {}

  static create(id: ActorId, props: Props): Actor {
    return new Actor(id, props);
  }

  static restore(id: ActorId, props: Props): Actor {
    return new Actor(id, props);
  }
}
