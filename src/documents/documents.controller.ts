import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    Body,
  } from '@nestjs/common';
  import { DocumentsService } from './documents.service';
  import { FilesInterceptor } from '@nestjs/platform-express';
  
  @Controller('documents')
  export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}
  
    @Post('upload')
    @UseInterceptors(FilesInterceptor('files', 10)) // Accepts multiple files (max 10)
    async uploadDocuments(
      @UploadedFiles() files: Express.Multer.File[],
      @Body() body: any,
    ) {
      if (!files || files.length === 0) {
        throw new Error("At least one file must be uploaded.");
      }
  
      return this.documentsService.uploadDocuments(files, body);
    }
  }