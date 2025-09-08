import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseConfigModule,
  TypeOrmMovieModule,
} from '@cinecom/typeorm-movie';
import { UuidMovieModule } from '@cinecom/uuid-movie';
import { MovieController } from './presentation/MovieController';
import {
  CreateMovieInteractor,
  MovieDomainService,
  MovieExistanceService,
  MovieToken,
} from '@cinecom/movie';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          database: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'cinecom',
            password: process.env.DB_PASSWORD || 'cinecom_dev_password',
            database: process.env.DB_DATABASE || 'cinecom_dev',
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development',
            ssl: process.env.DB_SSL === 'true',
          },
        }),
      ],
    }),
    DatabaseConfigModule,
    TypeOrmMovieModule,
    UuidMovieModule,
  ],
  controllers: [MovieController],
  providers: [
    {
      provide: MovieToken.CreateMovieUsecase,
      useClass: CreateMovieInteractor,
    },
    MovieDomainService,
    MovieExistanceService,
  ],
})
export class AppModule {}
