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

@Entity('movie_actors')
@Unique(['movie_id', 'actor_id'])
export class MovieActorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'movie_id' })
  movieId: string;

  @Column('uuid', { name: 'actor_id' })
  actorId: string;

  // Movie情報は外部キーのみで管理（マイクロサービス分離）
  // MovieRecord リレーションは削除し、API経由で取得

  @ManyToOne(() => ActorRecord, (actor) => actor.movieActors)
  @JoinColumn({ name: 'actor_id' })
  actor: ActorRecord;

  @Column('varchar', { length: 100, nullable: true, name: 'character_name' })
  characterName: string;

  @Column('varchar', { length: 20, default: 'supporting', name: 'role_type' })
  roleType: string; // main, supporting, cameo

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
