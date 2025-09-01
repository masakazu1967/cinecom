import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity('parallel_scene_groups')
export class ParallelSceneGroupRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  movie_id: string;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column('varchar', { length: 100, nullable: true })
  group_name: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
