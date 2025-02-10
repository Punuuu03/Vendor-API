import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Load environment variables early
import { config } from 'dotenv';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { DocumentsModule } from './documents/documents.module';

config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available across the entire application
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306, // Ensuring proper number parsing
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'vendor',
      autoLoadEntities: true,
      synchronize: true, // Disable in production and use migrations instead
      migrationsRun: true, // Run migrations instead
      migrations: ['dist/migrations/*.js'],
    }),
    UsersModule,
    CategoriesModule,
    SubcategoriesModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
