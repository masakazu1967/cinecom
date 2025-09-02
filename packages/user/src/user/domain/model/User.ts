import { Entity, Version } from '@cinecom/shared';
import { UserId } from './UserId';

type Props = {};

export class User extends Entity<UserId, Props> {
  private constructor(id: UserId, props: Props, version?: Version) {
    super(id, props, version);
  }

  protected validate(props: Props): void {}

  static create(id: UserId, props: Props): User {
    return new User(id, props);
  }

  static restore(id: UserId, props: Props, version: Version): User {
    return new User(id, props, version);
  }
}
