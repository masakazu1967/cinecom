import { Body, Controller, Post } from '@nestjs/common';
import { CreateMovieRequest, type CreateMovieUsecase } from '@cinecom/movie';
import { MovieViewModel } from './MovieViewModel';

class CreateMovieDto {
  title: string;
}

@Controller('/movies')
export class MovieController {
  constructor(private readonly createMovieUsecase: CreateMovieUsecase) {}

  /**
   * - DuplicateError
   * - NotFoundError
   * - DomainError
   * - InfrastructureError
   * @param dto 映像作品作成DTO
   * @returns 登録された映像作品ビューモデル
   */
  @Post()
  async create(@Body() dto: CreateMovieDto): Promise<MovieViewModel> {
    const request = CreateMovieRequest.create(dto);
    const response = await this.createMovieUsecase.execute(request);

    return MovieViewModel.convert(response.movie);
  }
}
