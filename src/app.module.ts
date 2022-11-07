import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { getConfig } from 'src/utils';
import { AuthModule } from './auth/auth.module';
import { TtalkModule } from './ttalk/ttalk.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [getConfig],
    }),
    AuthModule,
    TtalkModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
