import { InvalidFormatError } from '@cinecom/shared';
import { MovieId } from './MovieId';
import { MovieIdFixture } from './MovieId.fixture';

describe('MovieId', () => {
  describe('create', () => {
    it(`
      Arrange:
        - A valid UUID string
      Act:
        - Call MovieId.create() with the UUID
      Assert:
        - Expect the result to be an instance of MovieId
    `, () => {
      // Arrange
      const value = MovieIdFixture.of().value;
      // Act
      const result = MovieId.create(value);
      // Assert
      expect(result).toBeInstanceOf(MovieId);
    });

    it(`
      Arrange:
        - An invalid UUID string
      Act:
        - Call MovieId.create() with the invalid UUID
      Assert:
        - Expect an InvalidFormatError to be thrown with the correct message and field name
    `, () => {
      // Arrange
      const value = '';
      try {
        // Act
        MovieId.create(value);
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(InvalidFormatError);
        if (error instanceof InvalidFormatError) {
          expect(error.message).toBe(`Invalid ${MovieId.VALUE_OBJECT_NAME}`);
          expect(error.fieldName).toBe(MovieId.VALUE_OBJECT_NAME);
        }
      }
    });
  });
});
