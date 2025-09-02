import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SceneActorRecord } from './SceneActorRecord';
import { SceneDialogueRecord } from './SceneDialogueRecord';

@Entity('scenes')
export class SceneRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'movie_id' })
  movieId: string;

  // MovieRecordリレーションは削除（マイクロサービス分離）
  // movie情報はAPI経由で取得

  // 時間情報
  @Column('int', { name: 'start_time_seconds' })
  startTimeSeconds: number;

  @Column('int', { name: 'end_time_seconds' })
  endTimeSeconds: number;

  // L-dialogue 3階層分類システム
  @Column('varchar', { length: 10, name: 'level1_classification' })
  level1Classification: string; // A, R, C, S, D, L, O

  @Column('varchar', { length: 20, name: 'level2_classification' })
  level2Classification: string; // A1, R3, L2 等

  @Column('text', {
    array: true,
    nullable: true,
    name: 'level3_classification',
  })
  level3Classification: string[]; // 複数選択対応

  // シーン基本情報
  @Column('varchar', { length: 200, nullable: true, name: 'scene_title' })
  sceneTitle: string;

  @Column('text', { nullable: true, name: 'scene_description' })
  sceneDescription: string;

  @Column('varchar', { length: 100, nullable: true })
  location: string;

  // 感情・雰囲気タグ
  @Column('text', { array: true, default: [], name: 'emotion_tags' })
  emotionTags: string[];

  @Column('text', { array: true, default: [], name: 'atmosphere_tags' })
  atmosphereTags: string[];

  // 台詞情報
  @Column('boolean', { default: false, name: 'has_dialogue' })
  hasDialogue: boolean;

  @Column('text', { array: true, nullable: true, name: 'memorable_quotes' })
  memorableQuotes: string[];

  // メタデータ
  @Column('boolean', { default: false, name: 'is_parallel_scene' })
  isParallelScene: boolean;

  @Column('uuid', { nullable: true, name: 'parallel_scene_group_id' })
  parallelSceneGroupId: string;

  @Column('text', { nullable: true, name: 'data_entry_notes' })
  dataEntryNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // リレーション
  @OneToMany(() => SceneActorRecord, (sceneActor) => sceneActor.scene)
  sceneActors: SceneActorRecord[];

  @OneToMany(() => SceneDialogueRecord, (dialogue) => dialogue.scene)
  dialogues: SceneDialogueRecord[];
}
