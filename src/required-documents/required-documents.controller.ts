import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { RequiredDocumentsService } from './required-documents.service';
@Controller('required-documents')
export class RequiredDocumentsController {
    constructor(private readonly requiredDocumentsService: RequiredDocumentsService) { }

    @Post()
    async create(
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_id', ParseIntPipe) subcategoryId: number,
        @Body('document_names') documentNames: string
    ) {
        return this.requiredDocumentsService.create(categoryId, subcategoryId, documentNames);
    }

    @Get()
    async findAll() {
        return this.requiredDocumentsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requiredDocumentsService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body('document_names') documentNames: string
    ) {
        return this.requiredDocumentsService.update(id, documentNames);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.requiredDocumentsService.remove(id);
    }


    @Get(':categoryId/:subcategoryId')
async findByCategoryAndSubcategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('subcategoryId', ParseIntPipe) subcategoryId: number
) {
    return this.requiredDocumentsService.findByCategoryAndSubcategory(categoryId, subcategoryId);
}

}
