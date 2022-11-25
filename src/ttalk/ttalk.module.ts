import { Module } from '@nestjs/common';
import { TtalkService } from './ttalk.service';
import { TtalkController } from './ttalk.controller';
import {
  MessageRecordProviders,
  OfflineEventsProviders,
  TTalkOnlineProviders,
  TTalkUserConcatProviders,
  TTalkUserProviders,
} from './talk.providers';
import { MysqlDatabaseModule } from 'src/comm/database/mysql.module';
import { AuthModule } from 'src/auth/auth.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [MysqlDatabaseModule, AuthModule],
  controllers: [TtalkController],
  providers: [
    TtalkService,
    ...TTalkUserProviders,
    ...TTalkUserConcatProviders,
    ...TTalkOnlineProviders,
    ...MessageRecordProviders,
    ...OfflineEventsProviders,
    EventsGateway,
  ],
})
export class TtalkModule {}
