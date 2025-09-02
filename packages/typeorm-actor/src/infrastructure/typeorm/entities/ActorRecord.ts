import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovieActorRecord } from './MovieActorRecord';

@Entity('actors')
export class ActorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 100, nullable: true, name: 'name_original' })
  nameOriginal: string;

  @Column('date', { nullable: true, name: 'birth_date' })
  birthDate: Date;

  @Column('varchar', { length: 50, nullable: true })
  nationality: string;

  @Column('varchar', { length: 500, nullable: true, name: 'profile_image_url' })
  profileImageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // リレーション（Actor Serviceが管理する関係のみ）
  @OneToMany(() => MovieActorRecord, (movieActor) => movieActor.actor)
  movieActors: MovieActorRecord[];
}
