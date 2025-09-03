import { mock } from 'jest-mock-extended';
import { MovieDomainService } from '../../domain/service/MovieDomainService';
import { CreateMovieInteractor } from './CreateMovieInteractor';
import { MovieFixture } from '../../domain/model/Movie.fixture';
import { CreateMovieRequest } from './CreateMovieRequest';
import { CreateMovieResponse } from './CreateMovieResponse';
import { MovieApplicationModel } from '../MovieApplicationModel';
import { TitleFixture } from '../../domain/model/Title.fixture';

describe('CreateMovieInteractor', () => {
  let createMovieInteractor: CreateMovieInteractor;
  let movieDomainService: MovieDomainService;

  beforeEach(() => {
    movieDomainService = mock();
    createMovieInteractor = new CreateMovieInteractor(movieDomainService);
  });

  describe('execute', () => {
    it(`
      Arrange:
        - A CreateMovieRequest instance
        - movieDomainService.create() returns a Movie instance
      Act:
        - Call CreateMovieInteractor.execute() with the CreateMovieRequest
      Assert:
        - Expect the result to be a CreateMovieResponse instance containing the Application Model Movie
    `, async () => {
      // Arrange
      const movie = MovieFixture.of().setVersionValue(1).build();
      movieDomainService.create = jest.fn().mockResolvedValue(movie);
      const request = CreateMovieRequest.create({ title: movie.title.value });
      // Act
      const actual = await createMovieInteractor.execute(request);
      // Assert
      expect(actual).toBeInstanceOf(CreateMovieResponse);
      const applicationModel = new MovieApplicationModel();
      applicationModel.id = movie.id.value;
      applicationModel.title = movie.title.value;
      applicationModel.version = movie.version?.value;
      expect(actual.movie).toStrictEqual(applicationModel);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieDomainService.create).toHaveBeenCalledWith(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieDomainService.create).toHaveBeenCalledTimes(1);
    });

    it(`
      Arrange:
        - A CreateMovieRequest instance
        - movieDomainService.create() throws an error
      Act:
        - Call CreateMovieInteractor.execute() with the CreateMovieRequest
      Assert:
        - Expect the error to be thrown
    `, async () => {
      // Arrange
      const request = CreateMovieRequest.create({
        title: TitleFixture.of().value,
      });
      const error = new Error('Some error');
      movieDomainService.create = jest.fn().mockRejectedValue(error);
      // Act
      try {
        await createMovieInteractor.execute(request);
        fail('CreateMovieInteractor.execute() should throw');
      } catch (actualError) {
        // Assert
        expect(actualError).toBe(error);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieDomainService.create).toHaveBeenCalledWith(request);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieDomainService.create).toHaveBeenCalledTimes(1);
      }
    });
  });
});
