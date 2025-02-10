import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10)) // Accepts multiple files (max 10)
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    try {
      console.log('📂 Received Files:', files);
      console.log('📝 Received Body:', body);

      if (!files || files.length === 0) {
        throw new BadRequestException("At least one file must be uploaded.");
      }

      return this.documentsService.uploadDocuments(files, body);
    } catch (error) {
      console.error('❌ Controller Error:', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  // 📌 GET API to fetch all documents
  @Get('list')
  async getAllDocuments() {
    try {
      return this.documentsService.getAllDocuments();
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  // 📌 PUT API to update document status
  @Put('update-status/:id')
  async updateDocumentStatus(
    @Param('id') documentId: number,
    @Body('status') status: string,
  ) {
    try {
      if (!status) {
        throw new BadRequestException('Status is required.');
      }

      return this.documentsService.updateDocumentStatus(documentId, status);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      throw new InternalServerErrorException('Failed to update document status');
    }
  }

  // 📌 PUT API to assign Distributor to a Document
  @Put('assign-distributor/:id')
async assignDistributor(
  @Param('id') documentId: number,
  @Body() body: any, // Log the full body to debug
) {
  console.log("📩 Received request body:", body); // Debugging Log

  const distributorId = body.distributor_id;

  if (!distributorId) {
    throw new BadRequestException('Distributor user ID is required.');
  }

  return this.documentsService.assignDistributor(documentId, distributorId);
  }




  // 📌 GET API to fetch documents by distributor_id
@Get('list/:distributorId')
async getDocumentsByDistributor(@Param('distributorId') distributorId: string) {
  try {
    if (!distributorId) {
      throw new BadRequestException('Distributor ID is required.');
    }

    return this.documentsService.getAllDocumentsByDistributor(distributorId);
  } catch (error) {
    console.error('❌ Error fetching distributor documents:', error);
    throw new InternalServerErrorException('Failed to fetch documents for distributor');
  }
}

}
