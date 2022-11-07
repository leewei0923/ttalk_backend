import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller('/server')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Version([VERSION_NEUTRAL])
  getHello(): string {
    return this.appService.getHello();
  }
}
