import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequiredDocument } from './required-document.entity';
import { Category } from '../categories/entities/categories.entity';
import { Subcategory } from '../subcategories/entities/subcategories.entity';

@Injectable()
export class RequiredDocumentsService {
    constructor(
        @InjectRepository(RequiredDocument)
        private readonly requiredDocumentRepository: Repository<RequiredDocument>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Subcategory)
        private readonly subcategoryRepository: Repository<Subcategory>,
    ) { }

    async create(categoryId: number, subcategoryId: number, documentNames: string): Promise<RequiredDocument> {
        const category = await this.categoryRepository.findOne({ where: { category_id: categoryId } });
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: subcategoryId } });
        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const requiredDocument = this.requiredDocumentRepository.create({ category, subcategory, document_names: documentNames });
        return this.requiredDocumentRepository.save(requiredDocument);
    }

    async findAll(): Promise<RequiredDocument[]> {
        return this.requiredDocumentRepository.find({ relations: ['category', 'subcategory'] });
    }

    async findOne(id: number): Promise<RequiredDocument> {
        const requiredDocument = await this.requiredDocumentRepository.findOne({ where: { id }, relations: ['category', 'subcategory'] });
        if (!requiredDocument) {
            throw new NotFoundException('Required Document not found');
        }
        return requiredDocument;
    }

    async update(id: number, documentNames: string): Promise<RequiredDocument> {
        const requiredDocument = await this.findOne(id);
        requiredDocument.document_names = documentNames;
        return this.requiredDocumentRepository.save(requiredDocument);
    }

    async remove(id: number): Promise<{ message: string }> {
        const requiredDocument = await this.findOne(id);
        await this.requiredDocumentRepository.remove(requiredDocument);
        return { message: 'Required Document deleted successfully' };
    }
}
