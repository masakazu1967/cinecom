import { ApiProperty } from '@nestjs/swagger';
import { MovieApplicationModel } from '@cinecom/movie';

export class MovieViewModel {
  @ApiProperty({
    description: '映像作品ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '映像作品のタイトル',
    example: 'スター・ウォーズ',
  })
  title: string;

  @ApiProperty({ description: 'バージョン番号', example: 1, required: false })
  version?: number;

  static convert(applicationModel: MovieApplicationModel): MovieViewModel {
    const { id, title, version } = applicationModel;
    const viewModel = new MovieViewModel();
    viewModel.id = id;
    viewModel.title = title;
    viewModel.version = version;
    return viewModel;
  }
}
