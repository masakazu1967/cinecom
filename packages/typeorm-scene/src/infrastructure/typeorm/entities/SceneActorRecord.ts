import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SceneRecord } from './SceneRecord';

@Entity('scene_actors')
@Unique(['scene_id', 'actor_id'])
export class SceneActorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'scene_id' })
  sceneId: string;

  @Column('uuid', { name: 'actor_id' })
  actorId: string;

  @ManyToOne(() => SceneRecord, (scene) => scene.sceneActors)
  @JoinColumn({ name: 'scene_id' })
  scene: SceneRecord;

  // ActorRecordリレーションは削除（マイクロサービス分離）
  // actor情報はAPI経由で取得

  @Column('boolean', { default: false, name: 'is_main_actor' })
  isMainActor: boolean;

  @Column('int', { nullable: true, name: 'screen_time_seconds' })
  screenTimeSeconds: number;

  @Column('int', { default: 0, name: 'dialogue_count' })
  dialogueCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
