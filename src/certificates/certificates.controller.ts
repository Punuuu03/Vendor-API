import {
    Controller,
    Post,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    Body,
  } from '@nestjs/common';
  import { CertificatesService } from './certificates.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  
  @Controller('certificates')
  export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) {}
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCertificate(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: any
    ) {
      return this.certificatesService.uploadCertificate(file, body);
    }
  
    // ✅ Fetch a single document by certificate_id
    @Get(':certificate_id')
    async getDocumentById(@Param('certificate_id') certificateId: string) {
      return this.certificatesService.getDocumentById(certificateId);
    }
  
    // ✅ Fetch all documents
    @Get()
    async getAllDocuments() {
      return this.certificatesService.getAllDocuments();
    }


    @Get('document/:documentId')
  async getCertificatesByDocumentId(@Param('documentId') documentId: string) {
    return this.certificatesService.getCertificatesByDocumentId(documentId);
  }
  }
  