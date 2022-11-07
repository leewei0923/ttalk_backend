import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from '../../utils/index';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { ttalk_user } from 'src/ttalk/entities/ttalk.entity.mysql';

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
  entities: [ttalk_user],
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
