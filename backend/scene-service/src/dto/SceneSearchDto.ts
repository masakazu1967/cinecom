import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsUUID, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SceneSearchDto {
  @IsOptional()
  @IsUUID()
  movie_id?: string;

  @IsOptional()
  @IsString()
  level1_classification?: string; // A, R, C, S, D, L, O

  @IsOptional()
  @IsString()
  level2_classification?: string; // A1, R3, L2 等

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  level3_classification?: string[]; // 複数選択対応

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  start_time_from?: number; // 秒単位

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  start_time_to?: number; // 秒単位

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  duration_from?: number; // 秒単位

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  duration_to?: number; // 秒単位

  @IsOptional()
  @IsString()
  search_text?: string; // シーンタイトル・説明での検索

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emotion_tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  atmosphere_tags?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  has_dialogue?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_parallel_scene?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  // ページネーション
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // ソート
  @IsOptional()
  @IsString()
  sort_by?: string = 'start_time_seconds'; // start_time_seconds, created_at, scene_title

  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC' = 'ASC';
}