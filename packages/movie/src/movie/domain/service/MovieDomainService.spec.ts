import { mock } from 'jest-mock-extended';
import { MovieDomainService } from './MovieDomainService';
import { MovieExistanceService } from './MovieExistanceService';
import { MovieIdGenerator } from './MovieIdGenerator';
import { MovieRepository } from './MovieRepository';
import { MovieIdFixture } from '../model/MovieId.fixture';
import { TitleFixture } from '../model/Title.fixture';
import { CreateMovieRequest } from '../../application/create-movie/CreateMovieRequest';
import {
  DuplicateError,
  NotFoundError,
  OutOfRangeError,
} from '@cinecom/shared';
import { Movie } from '../model/Movie';
import { MovieFixture } from '../model/Movie.fixture';
import { Title } from '../model/Title';

describe('MovieDomainService', () => {
  let movieDomainService: MovieDomainService;
  let movieIdGenerator: MovieIdGenerator;
  let movieRepository: MovieRepository;
  let movieExistanceService: MovieExistanceService;

  beforeEach(() => {
    movieIdGenerator = mock();
    movieRepository = mock();
    movieExistanceService = mock();
    movieDomainService = new MovieDomainService(
      movieRepository,
      movieIdGenerator,
      movieExistanceService,
    );
  });

  describe('create', () => {
    it(`
      Arrange:
        - movieExistanceService.exists() returns true
      Act:
        - Call MovieDomainService.create() with the UUID
      Assert:
        - Expect throws DuplicateError
    `, async () => {
      // Arrange
      const value = MovieIdFixture.of().build();
      movieIdGenerator.generate = jest.fn().mockReturnValue(value);
      movieExistanceService.exists = jest.fn().mockResolvedValue(true);
      const title = TitleFixture.of().value;
      const request = CreateMovieRequest.create({ title });
      try {
        // Act
        await movieDomainService.create(request);
        fail('MovieDomainService.create() should throw');
      } catch (error) {
        expect(error).toBeInstanceOf(DuplicateError);
        if (error instanceof DuplicateError) {
          expect(error.message).toBe('Movie already exists');
          expect(error.fieldName).toBe(Movie.ENTITY_NAME);
        } else {
          fail('Error is not an instance of DuplicateError');
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieIdGenerator.generate).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieExistanceService.exists).toHaveBeenCalledTimes(1);
        const movie = MovieFixture.of().build();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieExistanceService.exists).toHaveBeenCalledWith(movie);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieRepository.save).not.toHaveBeenCalled();
      }
    });

    it(`
      Arrange:
        - movieExistanceService.exists() returns false
        - タイトルが異常値
      Act:
        - Call MovieDomainService.create() with the UUID
      Assert:
        - Expect throws OutOfRangeError
    `, async () => {
      // Arrange
      const value = MovieIdFixture.of().build();
      movieIdGenerator.generate = jest.fn().mockReturnValue(value);
      const title = '';
      const request = CreateMovieRequest.create({ title });
      try {
        // Act
        await movieDomainService.create(request);
        fail('MovieDomainService.create() should throw');
      } catch (error) {
        expect(error).toBeInstanceOf(OutOfRangeError);
        if (error instanceof OutOfRangeError) {
          expect(error.message).toBe('Value is too small. Minimum is 1');
          expect(error.fieldName).toBe(Title.VALUE_OBJECT_NAME);
          expect(error.min).toBe(Title.MIN_LENGTH);
        } else {
          fail('Error is not an instance of NotFoundError');
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieIdGenerator.generate).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieExistanceService.exists).not.toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieRepository.save).not.toHaveBeenCalled();
      }
    });

    it(`
      Arrange:
        - movieExistanceService.exists() returns false
        - タイトルが正常値
        - movieRepository.findById() returns null
      Act:
        - Call MovieDomainService.create()
      Assert:
        - movieIdGenerator.generate() is called once
        - movieExistanceService.exists() is called once with the expected Movie instance
        - movieRepository.save() is called once
        - movieRepository.findById() is called once with the generated MovieId
        - NotFoundError is thrown
    `, async () => {
      // Arrange
      const id = MovieIdFixture.of().build();
      movieIdGenerator.generate = jest.fn().mockReturnValue(id);
      movieExistanceService.exists = jest.fn().mockResolvedValue(false);
      const title = TitleFixture.of().build();
      const request = CreateMovieRequest.create({ title: title.value });
      const movie = MovieFixture.of().build();
      movieRepository.findById = jest.fn().mockResolvedValue(null);

      try {
        // Act
        await movieDomainService.create(request);
        fail('MovieDomainService.create() should throw');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toBe('Movie not found');
          expect(error.fieldName).toBe(Movie.ENTITY_NAME);
        } else {
          fail('Error is not an instance of NotFoundError');
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieIdGenerator.generate).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieExistanceService.exists).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieExistanceService.exists).toHaveBeenCalledWith(movie);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieRepository.save).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieRepository.save).toHaveBeenCalledWith(movie);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieRepository.findById).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(movieRepository.findById).toHaveBeenCalledWith(id);
      }
    });

    it(`
      Arrange:
        - movieExistanceService.exists() returns false
        - タイトルが正常値
        - movieRepository.findById() returns a Movie instance
      Act:
        - Call MovieDomainService.create()
      Assert:
        - movieIdGenerator.generate() is called once
        - movieExistanceService.exists() is called once with the expected Movie instance
        - movieRepository.save() is called once
        - movieRepository.findById() is called once with the generated MovieId
        - The returned Movie instance has the expected id and title
    `, async () => {
      // Arrange
      const id = MovieIdFixture.of().build();
      movieIdGenerator.generate = jest.fn().mockReturnValue(id);
      movieExistanceService.exists = jest.fn().mockResolvedValue(false);
      const title = TitleFixture.of().build();
      const request = CreateMovieRequest.create({ title: title.value });
      const movie = MovieFixture.of().setVersionValue(1).build();
      movieRepository.findById = jest.fn().mockResolvedValue(movie);

      // Act
      const actual = await movieDomainService.create(request);

      // Assert
      expect(actual).toBeInstanceOf(Movie);
      expect(actual).toStrictEqual(movie);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieIdGenerator.generate).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieExistanceService.exists).toHaveBeenCalledTimes(1);
      const expectedMovie = MovieFixture.of().build();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieExistanceService.exists).toHaveBeenCalledWith(expectedMovie);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.save).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.save).toHaveBeenCalledWith(expectedMovie);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findById).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
