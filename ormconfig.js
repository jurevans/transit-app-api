const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const {
  DB_TYPE: type,
  DB_HOST: host,
  DB_PORT: port,
  DB_USERNAME: username,
  DB_PASSWORD: password,
  DB_DATABASE: database,
  DB_SCHEMA: schema,
} = process.env;

module.exports = {
  type,
  host,
  port,
  username,
  password,
  database,
  schema,
  entities: ["dist/**/*.entity{.ts,.js}"],
  synchronize: false
};
