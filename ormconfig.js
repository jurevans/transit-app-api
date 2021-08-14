const getMigrationsDirectory = () => {
  const dir = process.env.NODE_ENV === 'migration' ? 'src' : `${__dirname}`;
  return [`${dir}/migrations/**/*{.ts,.js}`];
};

module.exports = {
  type: 'postgres',
  schema: 'gtfs',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: getMigrationsDirectory(),
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
