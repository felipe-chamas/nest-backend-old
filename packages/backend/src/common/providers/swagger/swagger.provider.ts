import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export class Swagger {
  static init(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Blockchain API documentation')
      .setDescription('Blockchain API documentation')
      .setVersion('1.0')
      .addTag('harvestAPI')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api', app, document);
  }
}
