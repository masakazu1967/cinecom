import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateSceneDto, SceneSearchDto, UpdateSceneDto } from '../dto';
import { SceneRecord } from '../entities/SceneRecord';

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(SceneRecord)
    private readonly sceneRepository: Repository<SceneRecord>,
  ) {}

  async create(createSceneDto: CreateSceneDto): Promise<SceneRecord> {
    // 時間範囲の妥当性チェック
    if (createSceneDto.end_time_seconds <= createSceneDto.start_time_seconds) {
      throw new BadRequestException('終了時間は開始時間より後である必要があります');
    }

    // L1分類の妥当性チェック
    const validL1Classifications = ['A', 'R', 'C', 'S', 'D', 'L', 'O'];
    if (!validL1Classifications.includes(createSceneDto.level1_classification)) {
      throw new BadRequestException(`無効なLevel1分類です: ${createSceneDto.level1_classification}`);
    }

    const scene = this.sceneRepository.create(createSceneDto);
    return await this.sceneRepository.save(scene);
  }

  async findAll(searchDto: SceneSearchDto): Promise<{ data: SceneRecord[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sort_by = 'start_time_seconds', sort_order = 'ASC' } = searchDto;

    const query = this.sceneRepository.createQueryBuilder('scene')
      .leftJoinAndSelect('scene.movie', 'movie')
      .leftJoinAndSelect('scene.scene_actors', 'scene_actors')
      .leftJoinAndSelect('scene_actors.actor', 'actor');

    // 検索条件の適用
    this.applySearchFilters(query, searchDto);

    // ソート
    query.orderBy(`scene.${sort_by}`, sort_order);

    // ページネーション
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<SceneRecord> {
    const scene = await this.sceneRepository.findOne({
      where: { id },
      relations: ['movie', 'scene_actors', 'scene_actors.actor', 'dialogues', 'dialogues.actor'],
    });

    if (!scene) {
      throw new NotFoundException(`Scene with ID ${id} not found`);
    }

    return scene;
  }

  async update(id: string, updateSceneDto: UpdateSceneDto): Promise<SceneRecord> {
    const scene = await this.findOne(id);

    // 時間範囲の妥当性チェック（更新時）
    if (updateSceneDto.end_time_seconds && updateSceneDto.start_time_seconds) {
      if (updateSceneDto.end_time_seconds <= updateSceneDto.start_time_seconds) {
        throw new BadRequestException('終了時間は開始時間より後である必要があります');
      }
    }

    Object.assign(scene, updateSceneDto);
    return await this.sceneRepository.save(scene);
  }

  async remove(id: string): Promise<void> {
    const scene = await this.findOne(id);
    await this.sceneRepository.remove(scene);
  }

  // L-dialogue分類による検索
  async findByClassification(level1: string, level2?: string): Promise<SceneRecord[]> {
    const query = this.sceneRepository.createQueryBuilder('scene')
      .leftJoinAndSelect('scene.movie', 'movie')
      .where('scene.level1_classification = :level1', { level1 });

    if (level2) {
      query.andWhere('scene.level2_classification = :level2', { level2 });
    }

    return await query.getMany();
  }

  // 時間オーバーラップ検索（GiSTインデックス活用）
  async findOverlappingScenes(movieId: string, startTime: number, endTime: number): Promise<SceneRecord[]> {
    return await this.sceneRepository
      .createQueryBuilder('scene')
      .leftJoinAndSelect('scene.movie', 'movie')
      .where('scene.movie_id = :movieId', { movieId })
      .andWhere('int4range(scene.start_time_seconds, scene.end_time_seconds) && int4range(:startTime, :endTime)', {
        startTime,
        endTime,
      })
      .orderBy('scene.start_time_seconds', 'ASC')
      .getMany();
  }

  // 映画別シーン一覧
  async findByMovie(movieId: string): Promise<SceneRecord[]> {
    return await this.sceneRepository.find({
      where: { movie_id: movieId },
      relations: ['movie', 'scene_actors', 'scene_actors.actor'],
      order: { start_time_seconds: 'ASC' },
    });
  }

  // 分類統計情報
  async getClassificationStats(): Promise<any> {
    const level1Stats = await this.sceneRepository
      .createQueryBuilder('scene')
      .select('scene.level1_classification', 'classification')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scene.level1_classification')
      .getRawMany();

    const level2Stats = await this.sceneRepository
      .createQueryBuilder('scene')
      .select('scene.level1_classification', 'level1')
      .addSelect('scene.level2_classification', 'level2')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scene.level1_classification, scene.level2_classification')
      .getRawMany();

    return {
      level1_statistics: level1Stats,
      level2_statistics: level2Stats,
    };
  }

  private applySearchFilters(query: SelectQueryBuilder<SceneRecord>, searchDto: SceneSearchDto): void {
    if (searchDto.movie_id) {
      query.andWhere('scene.movie_id = :movieId', { movieId: searchDto.movie_id });
    }

    if (searchDto.level1_classification) {
      query.andWhere('scene.level1_classification = :level1', { level1: searchDto.level1_classification });
    }

    if (searchDto.level2_classification) {
      query.andWhere('scene.level2_classification = :level2', { level2: searchDto.level2_classification });
    }

    if (searchDto.level3_classification && searchDto.level3_classification.length > 0) {
      query.andWhere('scene.level3_classification && ARRAY[:...level3]', { level3: searchDto.level3_classification });
    }

    if (searchDto.start_time_from !== undefined) {
      query.andWhere('scene.start_time_seconds >= :startTimeFrom', { startTimeFrom: searchDto.start_time_from });
    }

    if (searchDto.start_time_to !== undefined) {
      query.andWhere('scene.start_time_seconds <= :startTimeTo', { startTimeTo: searchDto.start_time_to });
    }

    if (searchDto.duration_from !== undefined) {
      query.andWhere('(scene.end_time_seconds - scene.start_time_seconds) >= :durationFrom', { durationFrom: searchDto.duration_from });
    }

    if (searchDto.duration_to !== undefined) {
      query.andWhere('(scene.end_time_seconds - scene.start_time_seconds) <= :durationTo', { durationTo: searchDto.duration_to });
    }

    if (searchDto.search_text) {
      query.andWhere(
        '(scene.scene_title ILIKE :searchText OR scene.scene_description ILIKE :searchText)',
        { searchText: `%${searchDto.search_text}%` }
      );
    }

    if (searchDto.emotion_tags && searchDto.emotion_tags.length > 0) {
      query.andWhere('scene.emotion_tags && ARRAY[:...emotionTags]', { emotionTags: searchDto.emotion_tags });
    }

    if (searchDto.atmosphere_tags && searchDto.atmosphere_tags.length > 0) {
      query.andWhere('scene.atmosphere_tags && ARRAY[:...atmosphereTags]', { atmosphereTags: searchDto.atmosphere_tags });
    }

    if (searchDto.has_dialogue !== undefined) {
      query.andWhere('scene.has_dialogue = :hasDialogue', { hasDialogue: searchDto.has_dialogue });
    }

    if (searchDto.is_parallel_scene !== undefined) {
      query.andWhere('scene.is_parallel_scene = :isParallelScene', { isParallelScene: searchDto.is_parallel_scene });
    }

    if (searchDto.location) {
      query.andWhere('scene.location ILIKE :location', { location: `%${searchDto.location}%` });
    }
  }
}
