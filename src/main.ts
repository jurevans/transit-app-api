import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPath = 'api/v1';
  app.setGlobalPrefix(apiPath);

  const config = new DocumentBuilder()
    .setTitle('GTFS API')
    .setDescription('This API serves GTFS data.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPath}/docs`, app, document);

  await app.listen(5000);
}
bootstrap();
