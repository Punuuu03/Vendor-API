import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/documents.entity';
import { S3Service } from './s3.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private readonly s3Service: S3Service,
  ) {}

  async uploadDocuments(files: Express.Multer.File[], body: any) {
    if (!files || !Array.isArray(files)) {
      throw new Error("Files are required and must be an array");
    }

    // Extract data from request body
    const { user_id, category_name, subcategory_name, name, email, phone, address } = body;

    // Upload files to AWS S3
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileUrl = await this.s3Service.uploadFile(file);
        return {
          document_type: file.mimetype,
          file_path: fileUrl
        };
      })
    );

    // Create document record
    const document = this.documentRepository.create({
      user_id,
      category_name,
      subcategory_name,
      name,
      email,
      phone,
      address,
      documents: uploadedFiles,
    });

    // Save document to database
    return this.documentRepository.save(document);
  }
}
