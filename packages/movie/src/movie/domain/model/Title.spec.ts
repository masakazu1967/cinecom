import { OutOfRangeError } from '@cinecom/shared';
import { Title } from './Title';

describe('Title', () => {
  describe('create', () => {
    describe('valid', () => {
      it(`
        Arrange:
          - A valid title string with length between Title.MIN_LENGTH and Title.MAX_LENGTH
        Act:
          - Call Title.create() with the valid title
        Assert:
          - Expect the result to be an instance of Title
      `, () => {
        // Arrange
        const value = 'A'.repeat(Title.MIN_LENGTH);
        // Act
        const result = Title.create(value);
        // Assert
        expect(result).toBeInstanceOf(Title);
      });

      it(`
        Arrange:
          - A valid title string with length between Title.MIN_LENGTH and Title.MAX_LENGTH
        Act:
          - Call Title.create() with the valid title
        Assert:
          - Expect the result to be an instance of Title
      `, () => {
        // Arrange
        const value = 'A'.repeat(Title.MAX_LENGTH);
        // Act
        const result = Title.create(value);
        // Assert
        expect(result).toBeInstanceOf(Title);
      });
    });

    describe('invalid', () => {
      it(`
        Arrange:
          - An empty title string
        Act:
          - Call Title.create() with the empty title
        Assert:
          - Expect an error to be thrown indicating the title is too short
      `, () => {
        // Arrange
        const value = '';
        try {
          // Act
          Title.create(value);
        } catch (error) {
          // Assert
          expect(error).toBeInstanceOf(OutOfRangeError);
          if (error instanceof OutOfRangeError) {
            expect(error.message).toBe(
              `Value is too small. Minimum is ${Title.MIN_LENGTH}`,
            );
            expect(error.fieldName).toBe(Title.VALUE_OBJECT_NAME);
            expect(error.min).toBe(Title.MIN_LENGTH);
          } else {
            fail('Expected an Error to be thrown');
          }
        }
      });

      it(`
        Arrange:
          - A title string that exceeds Title.MAX_LENGTH
        Act:
          - Call Title.create() with the too long title
        Assert:
          - Expect an error to be thrown indicating the title is too long
      `, () => {
        // Arrange
        const value = 'A'.repeat(Title.MAX_LENGTH + 1);
        try {
          // Act
          Title.create(value);
        } catch (error) {
          // Assert
          expect(error).toBeInstanceOf(OutOfRangeError);
          if (error instanceof OutOfRangeError) {
            expect(error.message).toBe(
              `Value is too big. Maximum is ${Title.MAX_LENGTH}`,
            );
            expect(error.fieldName).toBe(Title.VALUE_OBJECT_NAME);
            expect(error.max).toBe(Title.MAX_LENGTH);
          }
        }
      });
    });
  });
});
