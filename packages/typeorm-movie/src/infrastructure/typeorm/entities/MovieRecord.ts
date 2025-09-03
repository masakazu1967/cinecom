import { MovieId, MovieNotification, Title } from '@cinecom/movie';
import { Version } from '@cinecom/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('movies')
export class MovieRecord implements MovieNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 255, nullable: true, name: 'title_original' })
  titleOriginal: string;

  @Column('varchar', { length: 100, nullable: true })
  director: string;

  @Column('int', { nullable: true, name: 'release_year' })
  releaseYear: number;

  @Column('varchar', { length: 50, nullable: true })
  genre: string;

  @Column('int', { nullable: true, name: 'duration_minutes' })
  durationMinutes: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 20, default: 'basic', name: 'scene_info_level' })
  sceneInfoLevel: string; // basic, intermediate, detailed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // マイクロサービス分離により他サービスとのリレーションは削除
  // Scene, Actor関連は各々のサービスでAPI経由で取得
  setId(id: MovieId): void {
    this.id = id.value;
  }

  setTitle(title: Title): void {
    this.title = title.value;
  }

  setVersion(version?: Version): void {
    if (version) {
      this.version = version.value;
    }
  }
}
