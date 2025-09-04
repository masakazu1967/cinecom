import {
  CreateMovieRequest,
  type CreateMovieUsecase,
  MovieFixture,
  TitleFixture,
} from '@cinecom/movie';
import { MovieController } from './MovieController';
import { mock } from 'jest-mock-extended';
import { MovieViewModel } from './MovieViewModel';
import { CreateMovieResponse } from '@cinecom/movie/dist/movie/application/create-movie/CreateMovieResponse';

describe('MovieController', () => {
  let movieController: MovieController;
  let createMovieUsecase: CreateMovieUsecase;

  beforeEach(() => {
    createMovieUsecase = mock();
    movieController = new MovieController(createMovieUsecase);
  });

  describe('create', () => {
    it(`
      Arrange:
        - A valid CreateMovieDto object
        - A mock CreateMovieUsecase that returns a valid MovieApplicationModel
      Act:
        - Call MovieController.create() with the DTO
      Assert:
        - Expect the result to be an instance of MovieViewModel with matching properties
    `, async () => {
      // Arrange
      const dto = { title: TitleFixture.of().value };
      const movie = MovieFixture.of().setVersionValue(1).build();
      const response = CreateMovieResponse.create(movie);
      createMovieUsecase.execute = jest.fn().mockResolvedValue(response);

      // Act
      const actual = await movieController.create(dto);

      // Assert
      expect(actual).toBeInstanceOf(MovieViewModel);
      expect(actual.id).toBe(movie.id.value);
      expect(actual.title).toBe(movie.title.value);
      expect(actual.version).toBe(movie.version?.value);

      const request = CreateMovieRequest.create(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(createMovieUsecase.execute).toHaveBeenCalledWith(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(createMovieUsecase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
