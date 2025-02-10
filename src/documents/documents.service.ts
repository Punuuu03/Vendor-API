import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/documents.entity';
import { Express } from 'express';
import { S3Service } from './s3.service'; // ✅ Import S3Service

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,

    private readonly s3Service: S3Service // ✅ Inject S3Service properly
  ) { }
  async getAllDocuments() {
    try {
      const documents = await this.documentRepository.find();
      return { message: 'Documents fetched successfully', documents };
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Could not fetch documents');
    }
  }

  async updateDocumentStatus(documentId: number, status: string) {
    try {
      const document = await this.documentRepository.findOne({ where: { user_id: documentId } });

      if (!document) {
        throw new Error('Document not found.');
      }

      document.status = status;
      const updatedDocument = await this.documentRepository.save(document);

      return { message: 'Status updated successfully', document: updatedDocument };
    } catch (error) {
      console.error('❌ Error updating status:', error);
      throw new InternalServerErrorException('Could not update document status');
    }
  }

  async uploadDocuments(files: Express.Multer.File[], body: any) {
    try {
      console.log('📂 Received Files:', files);
      console.log('📝 Received Body:', body);

      if (!files || files.length === 0) {
        throw new BadRequestException("At least one file must be uploaded.");
      }

      const documentFiles = await Promise.all(
        files.map(async (file) => {
          const fileUrl = await this.s3Service.uploadFile(file); // ✅ Upload to S3
          return {
            document_type: file.mimetype,
            file_path: fileUrl, // ✅ Store S3 URL instead of local path
          };
        })
      );

      const document = this.documentRepository.create({
        user_id: parseInt(body.user_id, 10),
        category_name: body.category_name || '',
        subcategory_name: body.subcategory_name || '',
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        documents: documentFiles,
        status: 'Pending',
      });

      const savedDocument = await this.documentRepository.save(document);
      console.log('✅ Document saved successfully:', savedDocument);

      return { message: 'Upload successful', document: savedDocument };
    } catch (error) {
      console.error('❌ Error saving document:', error.message);
      throw new InternalServerErrorException('Failed to process document upload');
    }
  }
}
