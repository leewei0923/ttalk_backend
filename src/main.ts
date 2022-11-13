import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AllExceptionsFilter } from './comm/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './comm/exceptions/http.exception.filter';
import { TransformInterceptor } from './comm/interceptors/transform.interceptor';
import { generateDocument } from './doc';
import { AppModule } from './app.module';
import { FastifyLogger } from './comm/logger';
import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';

declare const module: any;

async function bootstrap() {
  const fastifyInstance: any = fastify({
    logger: FastifyLogger,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
  );

  // 接口版本化管理  Interface version management
  app.enableVersioning({
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
    type: VersioningType.URI,
  });

  // 统一响应体格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  // 创建文档
  generateDocument(app);
  app.enableCors();

  // 添加热更新
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // 添加cookie
  app.register(fastifyCookie, {
    secret: 'ttalk_secret',
  });

  await app.listen(3001);
}
bootstrap();
