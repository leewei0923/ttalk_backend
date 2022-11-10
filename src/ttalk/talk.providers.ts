import { ttalk_online } from './entities/online.entity.mysql';
import { ttalk_user } from './entities/ttalk.entity.mysql';
import { ttalk_user_concat } from './entities/user_concat.entity.mysql';

export const TTalkUserProviders = [
  {
    provide: 'TTALK_USER_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(ttalk_user),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];

export const TTalkUserConcatProviders = [
  {
    provide: 'TTALK_USER_CONCAT_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(ttalk_user_concat),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];

export const TTalkOnlineProviders = [
  {
    provide: 'TTALK_ONLINE_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(ttalk_online),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];
