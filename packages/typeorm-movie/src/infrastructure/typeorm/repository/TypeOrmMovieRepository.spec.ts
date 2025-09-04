import * as entities from '../entities';
import { Test } from '@nestjs/testing';
import { TypeOrmMovieRepository } from './TypeOrmMovieRepository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieFixture } from '@cinecom/movie';
import { MovieDataCreator } from './MovieDataCreator';
import { TitleFixture } from '@cinecom/movie/dist/movie/domain/model/Title.fixture';

describe('TypeOrmMovieRepository', () => {
  let movieRepository: TypeOrmMovieRepository;
  let movieDataCreator: MovieDataCreator;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: Object.values(entities),
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature(Object.values(entities)),
      ],
      providers: [
        {
          provide: 'MovieRepository',
          useClass: TypeOrmMovieRepository,
        },
        MovieDataCreator,
      ],
    }).compile();
    movieRepository = module.get<TypeOrmMovieRepository>('MovieRepository');
    movieDataCreator = module.get<MovieDataCreator>(MovieDataCreator);
  });

  afterEach(() => {});

  describe('Movieエンティティの読み書き検証', () => {
    it(`
      Arrange:
        - A Movie instance
      Act:
        - Save the Movie instance to the repository
        - Retrieve the Movie instance from the repository by its ID
      Assert:
        - Expect the retrieved Movie instance to match the saved Movie instance
    `, async () => {
      // Arrange
      const movie = MovieFixture.of().build();

      // Act
      await movieRepository.save(movie);
      const actual = await movieRepository.findById(movie.id);

      // Assert
      const expected = MovieFixture.of().setVersionValue(1).build();
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('findByTitle', () => {
    it(`
      Arrange:
        - A Movie instance saved in the repository
      Act:
        - Call MovieRepository.findByTitle() with a non-existing title
      Assert:
        - Expect the result to be null
    `, async () => {
      // Arrange
      await Promise.all([
        movieDataCreator.create(),
        movieDataCreator.setIndex(2).create(),
      ]);
      const title = TitleFixture.of().setIndex(1).build();

      // Act
      const actual = await movieRepository.findByTitle(title);

      // Assert
      expect(actual).toBeNull();
    });

    it(`
      Arrange:
        - A Movie instance saved in the repository
      Act:
        - Call MovieRepository.findByTitle() with the title of the saved Movie
      Assert:
        - Expect the returned Movie instance to match the saved Movie
    `, async () => {
      // Arrange
      const targetIndex = 1;
      await Promise.all([
        movieDataCreator.create(),
        movieDataCreator.setIndex(targetIndex).create(),
        movieDataCreator.setIndex(2).create(),
      ]);
      const title = TitleFixture.of().setIndex(targetIndex).build();

      // Act
      const actual = await movieRepository.findByTitle(title);

      // Assert
      const expected = MovieFixture.of()
        .setIndex(targetIndex)
        .setVersionValue(1)
        .build();
      expect(actual).toEqual(expected);
    });
  });
});
