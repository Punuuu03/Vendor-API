import { Controller, Get, Post, Put, Query, Delete, Param, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { FeildNamesService } from './feild_names.service';
import { FeildName } from './entities/feild_names.entity';

@Controller('field-names')
export class FeildNamesController {
    constructor(private readonly feildNamesService: FeildNamesService) { }

    @Post()
    async create(
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_id', ParseIntPipe) subcategoryId: number,
        @Body('document_fields') documentFeilds: string
    ): Promise<FeildName> {
        return await this.feildNamesService.create(categoryId, subcategoryId, documentFeilds);
    }







    @Get()
    async findAll(): Promise<FeildName[]> {
        return await this.feildNamesService.findAll();
    }

    @Get(':categoryId/:subcategoryId')
    async findByCategoryAndSubcategory(
        @Param('categoryId') categoryId: number,
        @Param('subcategoryId') subcategoryId: number
    ): Promise<FeildName[]> {
        const fieldNames = await this.feildNamesService.findByCategoryAndSubcategory(categoryId, subcategoryId);
        if (!fieldNames.length) {
            throw new NotFoundException(`No FieldNames found for categoryId ${categoryId} and subcategoryId ${subcategoryId}`);
        }
        return fieldNames;
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() feildNameData: Partial<FeildName>
    ): Promise<FeildName> {
        return await this.feildNamesService.update(id, feildNameData);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.feildNamesService.remove(id);
        return { message: `FeildName with ID ${id} successfully deleted` };
    }
}
