import { Scene } from '../model/Scene';
import { SceneId } from '../model/SceneId';

export interface SceneRepository {
  save(scene: Scene): Promise<void>;
  findById(id: SceneId): Promise<Scene | null>;
}
