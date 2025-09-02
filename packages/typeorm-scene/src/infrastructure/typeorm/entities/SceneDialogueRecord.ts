import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SceneRecord } from './SceneRecord';

@Entity('scene_dialogues')
export class SceneDialogueRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'scene_id' })
  sceneId: string;

  @Column('uuid', { nullable: true, name: 'actor_id' })
  actorId: string;

  @ManyToOne(() => SceneRecord, (scene) => scene.dialogues)
  @JoinColumn({ name: 'scene_id' })
  scene: SceneRecord;

  // ActorRecordリレーションは削除（マイクロサービス分離）
  // actor情報はAPI経由で取得

  @Column('varchar', { length: 100, nullable: true, name: 'character_name' })
  characterName: string;

  @Column('text', { name: 'dialogue_text' })
  dialogueText: string;

  @Column('int', { name: 'dialogue_order' })
  dialogueOrder: number;

  @Column('boolean', { default: false, name: 'is_memorable_quote' })
  isMemorableQuote: boolean;

  @Column('int', { nullable: true, name: 'timestamp_seconds' })
  timestampSeconds: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
