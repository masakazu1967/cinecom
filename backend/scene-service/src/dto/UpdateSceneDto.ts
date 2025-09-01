import { PartialType } from '@nestjs/mapped-types';
import { CreateSceneDto } from './CreateSceneDto';

export class UpdateSceneDto extends PartialType(CreateSceneDto) {}
