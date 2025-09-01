import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { SceneActorRecord } from './SceneActorRecord';
import { SceneDialogueRecord } from './SceneDialogueRecord';

@Entity('scenes')
export class SceneRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  movie_id: string;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  // 時間情報
  @Column('int')
  start_time_seconds: number;

  @Column('int')
  end_time_seconds: number;

  // L-dialogue 3階層分類システム
  @Column('varchar', { length: 10 })
  level1_classification: string; // A, R, C, S, D, L, O

  @Column('varchar', { length: 20 })
  level2_classification: string; // A1, R3, L2 等

  @Column('text', { array: true, nullable: true })
  level3_classification: string[]; // 複数選択対応

  // シーン基本情報
  @Column('varchar', { length: 200, nullable: true })
  scene_title: string;

  @Column('text', { nullable: true })
  scene_description: string;

  @Column('varchar', { length: 100, nullable: true })
  location: string;

  // 感情・雰囲気タグ
  @Column('text', { array: true, default: [] })
  emotion_tags: string[];

  @Column('text', { array: true, default: [] })
  atmosphere_tags: string[];

  // 台詞情報
  @Column('boolean', { default: false })
  has_dialogue: boolean;

  @Column('text', { array: true, nullable: true })
  memorable_quotes: string[];

  // メタデータ
  @Column('boolean', { default: false })
  is_parallel_scene: boolean;

  @Column('uuid', { nullable: true })
  parallel_scene_group_id: string;

  @Column('text', { nullable: true })
  data_entry_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // リレーション
  @OneToMany(() => SceneActorRecord, (sceneActor) => sceneActor.scene)
  scene_actors: SceneActorRecord[];

  @OneToMany(() => SceneDialogueRecord, (dialogue) => dialogue.scene)
  dialogues: SceneDialogueRecord[];
}
