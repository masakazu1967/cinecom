import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovieActorRecord } from './MovieActorRecord';
import { SceneActorRecord } from './SceneActorRecord';
import { SceneDialogueRecord } from './SceneDialogueRecord';

@Entity('actors')
export class ActorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 100, nullable: true })
  name_original: string;

  @Column('date', { nullable: true })
  birth_date: Date;

  @Column('varchar', { length: 50, nullable: true })
  nationality: string;

  @Column('varchar', { length: 500, nullable: true })
  profile_image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // リレーション
  @OneToMany(() => SceneActorRecord, (sceneActor) => sceneActor.actor)
  scene_actors: SceneActorRecord[];

  @OneToMany(() => MovieActorRecord, (movieActor) => movieActor.actor)
  movie_actors: MovieActorRecord[];

  @OneToMany(() => SceneDialogueRecord, (dialogue) => dialogue.actor)
  dialogues: SceneDialogueRecord[];
}
