import { mock } from 'jest-mock-extended';
import { MovieExistanceService } from './MovieExistanceService';
import { MovieRepository } from './MovieRepository';
import { MovieFixture } from '../model/Movie.fixture';

describe('MovieExistanceService', () => {
  let movieRepository: MovieRepository;
  let movieExistanceService: MovieExistanceService;

  beforeEach(() => {
    movieRepository = mock();
    movieExistanceService = new MovieExistanceService(movieRepository);
  });

  describe('exists', () => {
    it(`
      Arrange:
        - A Movie instance that does not exist in the repository
      Act:
        - Call MovieExistanceService.exists() with the Movie instance
      Assert:
        - Expect the result to be false
    `, async () => {
      // Arrange
      movieRepository.findByTitle = jest.fn().mockResolvedValue(null);
      const movie = MovieFixture.of().build();
      // Act
      const actual = await movieExistanceService.exists(movie);
      // Assert
      expect(actual).toBeFalsy();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findByTitle).toHaveBeenCalledWith(movie.title);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findByTitle).toHaveBeenCalledTimes(1);
    });

    it(`
      Arrange:
        - A Movie instance that exists in the repository and is the same as the provided movie
      Act:
        - Call MovieExistanceService.exists() with the Movie instance
      Assert:
        - Expect the result to be false
    `, async () => {
      // Arrange
      const movie = MovieFixture.of().build();
      movieRepository.findByTitle = jest.fn().mockResolvedValue(movie);
      // Act
      const actual = await movieExistanceService.exists(movie);
      // Assert
      expect(actual).toBeFalsy();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findByTitle).toHaveBeenCalledWith(movie.title);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findByTitle).toHaveBeenCalledTimes(1);
    });

    it(`
      Arrange:
        - A Movie instance that exists in the repository but is different from the provided movie
      Act:
        - Call MovieExistanceService.exists() with the Movie instance
      Assert:
        - Expect the result to be true
    `, async () => {
      // Arrange
      const existingMovie = MovieFixture.of().build();
      const movie = MovieFixture.of().setMovieIdIndex(1).build();
      movieRepository.findByTitle = jest.fn().mockResolvedValue(existingMovie);
      // Act
      const actual = await movieExistanceService.exists(movie);
      // Assert
      expect(actual).toBeTruthy();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findByTitle).toHaveBeenCalledWith(movie.title);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findByTitle).toHaveBeenCalledTimes(1);
    });
  });
});
