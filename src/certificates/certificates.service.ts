import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificates.entity';
import { S3Service } from './s3certificates.service';
import { Express } from 'express';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly s3Service: S3Service
  ) {}

  async uploadCertificate(file: Express.Multer.File, body: any) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }
  
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only images (JPG, PNG, WEBP) and PDFs are allowed.');
    }
  
    if (file.size > 200 * 1024) { // 200KB size limit
      throw new BadRequestException('File size must not exceed 200KB.');
    }
  
    const fileUrl = await this.s3Service.uploadFile(file);
  
    const certificate = this.certificateRepository.create({
      certificate_id: Number(body.certificate_id), // Convert to number
      certificate_name: body.certificate_name,
      user_id: Number(body.user_id), // Ensure correct type
      document_id: Number(body.document_id),
      distributor_id: Number(body.distributor_id),
      file_url: fileUrl,
    });
  
    return await this.certificateRepository.save(certificate);
  }
  
  // ✅ Fetch a single document by certificate_id
  async getDocumentById(certificateId: string) {
    const id = Number(certificateId); // Convert to number

    if (isNaN(id)) {
      throw new BadRequestException('Invalid certificate ID');
    }

    const document = await this.certificateRepository.findOne({
      where: { certificate_id: id }, // Use number type
    });

    if (!document) {
      throw new NotFoundException(`Certificate with ID ${certificateId} not found`);
    }

    return document;
  }

  // ✅ Fetch all documents
  async getAllDocuments() {
    return await this.certificateRepository.find();
  }


  async getCertificatesByDocumentId(documentId: string) {
    const id = Number(documentId); // Convert to number
  
    if (isNaN(id)) {
      throw new BadRequestException('Invalid document ID');
    }
  
    const certificates = await this.certificateRepository.find({
      where: { document_id: id },
    });
  
    if (!certificates.length) {
      throw new NotFoundException(`No certificates found for document ID ${documentId}`);
    }
  
    return certificates;
  }
  
}
