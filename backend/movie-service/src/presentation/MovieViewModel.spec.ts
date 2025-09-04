import {
  MovieApplicationModel,
  MovieIdFixture,
  TitleFixture,
} from '@cinecom/movie';
import { MovieViewModel } from './MovieViewModel';

describe('MovieViewModel', () => {
  describe('convert', () => {
    it(`
      Arrange:
        - A valid MovieApplicationModel object
      Act:
        - Call MovieViewModel.convert() with the application model
      Assert:
        - Expect the result to be an instance of MovieViewModel with matching properties
    `, () => {
      // Arrange
      const applicationModel = new MovieApplicationModel();
      applicationModel.id = MovieIdFixture.of().value;
      applicationModel.title = TitleFixture.of().value;
      applicationModel.version = 1;
      // Act
      const result = MovieViewModel.convert(applicationModel);
      // Assert
      expect(result).toBeInstanceOf(MovieViewModel);
      expect(result.id).toBe(applicationModel.id);
      expect(result.title).toBe(applicationModel.title);
      expect(result.version).toBe(applicationModel.version);
    });

    it(`
      Arrange:
        - An application model with undefined version
      Act:
        - Call MovieViewModel.convert() with the application model
      Assert:
        - Expect the result to have version set to undefined
    `, () => {
      // Arrange
      const applicationModel = new MovieApplicationModel();
      applicationModel.id = MovieIdFixture.of().value;
      applicationModel.title = TitleFixture.of().value;
      // Act
      const result = MovieViewModel.convert(applicationModel);
      // Assert
      expect(result).toBeInstanceOf(MovieViewModel);
      expect(result.id).toBe(applicationModel.id);
      expect(result.title).toBe(applicationModel.title);
      expect(result.version).toBeUndefined();
    });
  });
});
