const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

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
  entities: ["dist/**/*.entity{.ts,.js}"],
  synchronize: false
};
