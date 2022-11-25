import { message_record } from './entities/message_record.entity.mysql';
import { offline_events_record } from './entities/offline_events_record.entity.mysql';
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

export const MessageRecordProviders = [
  {
    provide: 'MESSAGE_RECORD_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(message_record),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];

export const OfflineEventsProviders = [
  {
    provide: 'OFFLINE_EVENTS_RECORD_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(offline_events_record),
    inject: ['MYSQL_DATA_SOURCE'],
  },
];
