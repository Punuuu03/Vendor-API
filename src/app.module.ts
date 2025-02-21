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
import { CertificatesModule } from './certificates/certificates.module';
import { RequiredDocumentsModule } from './required-documents/required-documents.module';
import { DocumentType } from './document-types/entities/document-type/document-type.entity.';
import { DocumentTypesModule } from './document-types/document-types.module';
import { StatisticsModule } from './statistics/statistics.module';
import { FeildNamesModule } from './feild_names/feild_names.module';
import { UserDashboardModule } from './userdashboard/userdashboard.module';
import { DownloadModule } from './download/download.module';
import { SingleDocumentModule } from './singledocument/singledocument.module';


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
      // migrationsRun: true, // Run migrations instead
      // migrations: ['dist/migrations/*.js'],
    }),
    UsersModule,
    CategoriesModule,
    SubcategoriesModule,
    DocumentsModule,
    DocumentTypesModule,
    CertificatesModule,
    RequiredDocumentsModule,
    DocumentType,
    FeildNamesModule,
    StatisticsModule,
    UserDashboardModule,
    DownloadModule,
    SingleDocumentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
