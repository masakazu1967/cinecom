export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  logging?: boolean;
  synchronize?: boolean;
}

export interface AppConfig {
  database: DatabaseConfig;
  port: number;
  nodeEnv: string;
}

export default (): AppConfig => ({
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'cinecom',
    password: process.env.DATABASE_PASSWORD || 'cinecom_dev_password',
    database: process.env.DATABASE_NAME || 'cinecom_dev',
    ssl: process.env.NODE_ENV === 'production',
    logging: process.env.NODE_ENV === 'development',
    synchronize: false, // 本番では必ずfalse
  },
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
});
