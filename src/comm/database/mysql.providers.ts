import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from '../../utils/index';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { ttalk_user } from 'src/ttalk/entities/ttalk.entity.mysql';
import { ttalk_user_concat } from 'src/ttalk/entities/user_concat.entity.mysql';
import { ttalk_online } from 'src/ttalk/entities/online.entity.mysql';
import { message_record } from 'src/ttalk/entities/message_record.entity.mysql';
import { offline_events_record } from 'src/ttalk/entities/offline_events_record.entity.mysql';
import { collect_record } from 'src/ttalk/entities/collect_record.entity.mysql';

/**
 * Mysql 数据库
 */

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mysql';
const { MYSQL_CONFIG } = getConfig();

const MYSQL_DATABASE_CONFIG = {
  ...MYSQL_CONFIG,
  type: databaseType,
  // entities: [
  //   path.join(__dirname, `dist/**/*.${MYSQL_CONFIG.entities}.entity{.ts,.js}`),
  // ],
  entities: [
    ttalk_user,
    ttalk_user_concat,
    ttalk_online,
    message_record,
    offline_events_record,
    collect_record,
  ],
};

const MYSQL_DATA_SOURCE = new DataSource(MYSQL_DATABASE_CONFIG);

// 数据库注入
export const MysqlDatabaseProviders = [
  {
    provide: 'MYSQL_DATA_SOURCE',
    useFactory: async () => {
      await MYSQL_DATA_SOURCE.initialize();
      return MYSQL_DATA_SOURCE;
    },
  },
];
