import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequiredDocumentsService } from './required-documents.service';
import { RequiredDocumentsController } from './required-documents.controller';
import { RequiredDocument } from './required-document.entity';
import { Category } from '../categories/entities/categories.entity';
import { Subcategory } from '../subcategories/entities/subcategories.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RequiredDocument, Category, Subcategory])],
    controllers: [RequiredDocumentsController],
    providers: [RequiredDocumentsService],
})
export class RequiredDocumentsModule { }
