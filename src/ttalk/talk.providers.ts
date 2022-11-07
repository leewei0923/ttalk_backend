import { ttalk_user } from './entities/ttalk.entity.mysql';

export const TTalkUserProviders = [
  {
    provide: 'TTALK_USER_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(ttalk_user),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];
