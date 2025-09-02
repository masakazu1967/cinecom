import { Entity, Version } from '@cinecom/shared';
import { SceneId } from './SceneId';

type Props = {};

export class Scene extends Entity<SceneId, Props> {
  private constructor(id: SceneId, props: Props, version?: Version) {
    super(id, props, version);
  }

  protected validate(props: Props): void {}

  static create(id: SceneId, props: Props): Scene {
    return new Scene(id, props);
  }

  static restore(id: SceneId, props: Props, version: Version): Scene {
    return new Scene(id, props, version);
  }
}
