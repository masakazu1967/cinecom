import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('parallel_scene_groups')
export class ParallelSceneGroupRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'movie_id' })
  movieId: string;

  // MovieRecordリレーションは削除（マイクロサービス分離）
  // movie情報はAPI経由で取得

  @Column('varchar', { length: 100, nullable: true, name: 'group_name' })
  groupName: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
