import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActorRecord } from './ActorRecord';
import { SceneRecord } from './SceneRecord';

@Entity('scene_actors')
@Unique(['scene_id', 'actor_id'])
export class SceneActorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  scene_id: string;

  @Column('uuid')
  actor_id: string;

  @ManyToOne(() => SceneRecord, (scene) => scene.scene_actors)
  @JoinColumn({ name: 'scene_id' })
  scene: SceneRecord;

  @ManyToOne(() => ActorRecord, (actor) => actor.scene_actors)
  @JoinColumn({ name: 'actor_id' })
  actor: ActorRecord;

  @Column('boolean', { default: false })
  is_main_actor: boolean;

  @Column('int', { nullable: true })
  screen_time_seconds: number;

  @Column('int', { default: 0 })
  dialogue_count: number;

  @CreateDateColumn()
  created_at: Date;
}
