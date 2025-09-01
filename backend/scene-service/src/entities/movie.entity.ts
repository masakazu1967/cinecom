import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovieActorRecord } from './MovieActorRecord';
import { SceneRecord } from './SceneRecord';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 255, nullable: true })
  title_original: string;

  @Column('varchar', { length: 100, nullable: true })
  director: string;

  @Column('int', { nullable: true })
  release_year: number;

  @Column('varchar', { length: 50, nullable: true })
  genre: string;

  @Column('int', { nullable: true })
  duration_minutes: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 20, default: 'basic' })
  scene_info_level: string; // basic, intermediate, detailed

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // リレーション
  @OneToMany(() => SceneRecord, (scene) => scene.movie)
  scenes: SceneRecord[];

  @OneToMany(() => MovieActorRecord, (movieActor) => movieActor.movie)
  movie_actors: MovieActorRecord[];
}
