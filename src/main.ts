// src/main.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

// Load environment variables globally

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  ConfigModule.forRoot(); 
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription('Registration & Login API with JWT')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}

bootstrap();
