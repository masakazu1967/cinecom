import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import {
  CreateMovieRequest,
  MovieToken,
  type CreateMovieUsecase,
} from '@cinecom/movie';
import { MovieViewModel } from './MovieViewModel';

class CreateMovieDto {
  @ApiProperty({
    description: '映像作品のタイトル',
    example: 'スター・ウォーズ',
  })
  title: string;
}

@ApiTags('movies')
@Controller('/movies')
export class MovieController {
  constructor(
    @Inject(MovieToken.CreateMovieUsecase)
    private readonly createMovieUsecase: CreateMovieUsecase,
  ) {}

  @ApiOperation({
    summary: '映像作品を作成',
    description: '新しい映像作品を作成します',
  })
  @ApiResponse({
    status: 201,
    description: '映像作品が正常に作成されました',
    type: MovieViewModel,
  })
  @ApiResponse({
    status: 400,
    description: '不正なリクエスト',
  })
  @ApiResponse({
    status: 409,
    description: '同じタイトルの映像作品が既に存在します',
  })
  @Post()
  async create(@Body() dto: CreateMovieDto): Promise<MovieViewModel> {
    const request = CreateMovieRequest.create(dto);
    const response = await this.createMovieUsecase.execute(request);

    return MovieViewModel.convert(response.movie);
  }
}
