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
import { Movie } from './movie.entity';

@Entity('movie_actors')
@Unique(['movie_id', 'actor_id'])
export class MovieActorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  movie_id: string;

  @Column('uuid')
  actor_id: string;

  @ManyToOne(() => Movie, (movie) => movie.movie_actors)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => ActorRecord, (actor) => actor.movie_actors)
  @JoinColumn({ name: 'actor_id' })
  actor: ActorRecord;

  @Column('varchar', { length: 100, nullable: true })
  character_name: string;

  @Column('varchar', { length: 20, default: 'supporting' })
  role_type: string; // main, supporting, cameo

  @CreateDateColumn()
  created_at: Date;
}
