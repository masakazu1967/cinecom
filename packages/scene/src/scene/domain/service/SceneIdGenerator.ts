import { SceneId } from '../model/SceneId';

export interface SceneIdGenerator {
  generate(): Promise<SceneId>;
}
