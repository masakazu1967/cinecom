import { Title } from '../../domain/model/Title';

type Props = {
  title: string;
};

export class CreateMovieRequest {
  private constructor(private readonly props: Props) {}

  get title(): Title {
    return Title.create(this.props.title);
  }

  static create(props: Props): CreateMovieRequest {
    return new CreateMovieRequest(props);
  }
}
