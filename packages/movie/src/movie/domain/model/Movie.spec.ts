import { Version } from '@cinecom/shared';
import { Movie } from './Movie';
import { MovieIdFixture } from './MovieId.fixture';
import { TitleFixture } from './Title.fixture';

describe('Movie', () => {
  describe('create', () => {
    it(`
      Arrange:
        - Valid MovieId and Title value objects
      Act:
        - Call Movie.create() with the valid value objects
      Assert:
        - Expect the result to be an instance of Movie
    `, () => {
      // Arrange
      const movieId = MovieIdFixture.of().build();
      const title = TitleFixture.of().build();
      // Act
      const actual = Movie.create(movieId, { title });
      // Assert
      expect(actual).toBeInstanceOf(Movie);
      expect(actual.id).toEqual(movieId);
      expect(actual.title).toEqual(title);
      expect(actual.version).toBeUndefined();
    });
  });

  describe('restore', () => {
    it(`
      Arrange:
        - Valid MovieId and Title value objects
        - A version number
      Act:
        - Call Movie.restore() with the valid value objects and version
      Assert:
        - Expect the result to be an instance of Movie
    `, () => {
      // Arrange
      const movieId = MovieIdFixture.of().build();
      const title = TitleFixture.of().build();
      const versionValue = 1;
      const version = Version.create(versionValue);
      // Act
      const actual = Movie.restore(movieId, { title }, version);
      // Assert
      expect(actual).toBeInstanceOf(Movie);
      expect(actual.id).toEqual(movieId);
      expect(actual.title).toEqual(title);
      expect(actual.version).toEqual(version);
    });
  });
});
