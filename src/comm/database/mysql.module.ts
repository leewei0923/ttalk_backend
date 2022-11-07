import { Module } from '@nestjs/common';
import { MysqlDatabaseProviders } from './mysql.providers';

@Module({
  providers: [...MysqlDatabaseProviders],
  exports: [...MysqlDatabaseProviders],
})
export class MysqlDatabaseModule {}
