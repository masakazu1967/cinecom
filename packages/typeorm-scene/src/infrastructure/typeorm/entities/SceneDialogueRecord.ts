import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActorRecord } from './ActorRecord';
import { SceneRecord } from './SceneRecord';

@Entity('scene_dialogues')
export class SceneDialogueRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  scene_id: string;

  @Column('uuid', { nullable: true })
  actor_id: string;

  @ManyToOne(() => SceneRecord, (scene) => scene.dialogues)
  @JoinColumn({ name: 'scene_id' })
  scene: SceneRecord;

  @ManyToOne(() => ActorRecord, (actor) => actor.dialogues, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: ActorRecord;

  @Column('varchar', { length: 100, nullable: true })
  character_name: string;

  @Column('text')
  dialogue_text: string;

  @Column('int')
  dialogue_order: number;

  @Column('boolean', { default: false })
  is_memorable_quote: boolean;

  @Column('int', { nullable: true })
  timestamp_seconds: number;

  @CreateDateColumn()
  created_at: Date;
}
