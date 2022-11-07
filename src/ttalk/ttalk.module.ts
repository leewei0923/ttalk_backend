import { Module } from '@nestjs/common';
import { TtalkService } from './ttalk.service';
import { TtalkController } from './ttalk.controller';
import { TTalkUserProviders } from './talk.providers';
import { MysqlDatabaseModule } from 'src/comm/database/mysql.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MysqlDatabaseModule, AuthModule],
  controllers: [TtalkController],
  providers: [TtalkService, ...TTalkUserProviders],
})
export class TtalkModule {}
