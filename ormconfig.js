const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env.NODE_ENV === 'development'
  ? '.env.local'
  : '.env';

dotenv.config({ path: path.join(__dirname, envFile) });

const {
  DB_HOST: host,
  DB_PORT: port,
  DB_USERNAME: username,
  DB_PASSWORD: password,
  DB_DATABASE: database,
} = process.env;

module.exports = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  schema: 'gtfs',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/migration/**/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
