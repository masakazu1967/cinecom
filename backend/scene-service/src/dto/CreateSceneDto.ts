import { IsNotEmpty, IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSceneDto {
  @IsNotEmpty()
  @IsUUID()
  movie_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  start_time_seconds: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  end_time_seconds: number;

  @IsNotEmpty()
  @IsString()
  level1_classification: string; // A, R, C, S, D, L, O

  @IsNotEmpty()
  @IsString()
  level2_classification: string; // A1, R3, L2 等

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  level3_classification?: string[]; // 複数選択対応

  @IsOptional()
  @IsString()
  scene_title?: string;

  @IsOptional()
  @IsString()
  scene_description?: string;

  @IsOptional()
  @IsString()
  location?: string;

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
  @IsArray()
  @IsString({ each: true })
  memorable_quotes?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_parallel_scene?: boolean;

  @IsOptional()
  @IsUUID()
  parallel_scene_group_id?: string;

  @IsOptional()
  @IsString()
  data_entry_notes?: string;
}