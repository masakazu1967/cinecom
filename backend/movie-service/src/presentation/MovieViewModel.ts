import { MovieApplicationModel } from '@cinecom/movie';

export class MovieViewModel {
  id: string;
  title: string;
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
