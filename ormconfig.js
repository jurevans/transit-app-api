const dotenv = require('dotenv');

dotenv.config();

const {
  DB_HOST: host,
  DB_PORT: port,
  DB_USERNAME: username,
  DB_PASSWORD: password,
  DB_DATABASE: database,
} = process.env;

const getMigrationsDirectory = () => {
  const dir = process.env.NODE_ENV === 'migration' ? 'src' : `${__dirname}`;
  return [`${dir}/migrations/**/*{.ts,.js}`];
};

module.exports = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  schema: 'gtfs',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: getMigrationsDirectory(),
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
