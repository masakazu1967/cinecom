import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreateSceneDto, SceneSearchDto, UpdateSceneDto } from '../dto';
import { ScenesService } from './ScenesService';

@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ValidationPipe({ transform: true })) createSceneDto: CreateSceneDto) {
    return await this.scenesService.create(createSceneDto);
  }

  @Get()
  async findAll(@Query(new ValidationPipe({ transform: true })) searchDto: SceneSearchDto) {
    return await this.scenesService.findAll(searchDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.scenesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true })) updateSceneDto: UpdateSceneDto,
  ) {
    return await this.scenesService.update(id, updateSceneDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.scenesService.remove(id);
  }

  // L-dialogue分類検索
  @Get('classification/:level1')
  async findByLevel1Classification(@Param('level1') level1: string) {
    return await this.scenesService.findByClassification(level1);
  }

  @Get('classification/:level1/:level2')
  async findByLevel2Classification(
    @Param('level1') level1: string,
    @Param('level2') level2: string,
  ) {
    return await this.scenesService.findByClassification(level1, level2);
  }

  // 時間オーバーラップ検索
  @Get('movie/:movieId/overlap')
  async findOverlappingScenes(
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
  ) {
    return await this.scenesService.findOverlappingScenes(movieId, startTime, endTime);
  }

  // 映画別シーン一覧
  @Get('movie/:movieId')
  async findByMovie(@Param('movieId', ParseUUIDPipe) movieId: string) {
    return await this.scenesService.findByMovie(movieId);
  }

  // 統計情報
  @Get('stats/classification')
  async getClassificationStats() {
    return await this.scenesService.getClassificationStats();
  }
}
