import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/documents.entity';
import { S3 } from 'aws-sdk';
import * as archiver from 'archiver';
import { Response } from 'express';

@Injectable()
export class DownloadService {
  private s3 = new S3();

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async downloadDocuments(documentId: number, res: Response) {
    const document = await this.documentRepository.findOne({ where: { document_id: documentId } });
    if (!document) throw new NotFoundException('Document not found');

    if (!document.documents || document.documents.length === 0) {
      throw new NotFoundException('No documents available for download');
    }

    const zipFileName = `${document.name.replace(/\s+/g, '_')}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const doc of document.documents) {
      try {
        const s3Object = await this.s3.getObject({
          Bucket: 'vendorpunam',
          Key: doc.file_path.trim(), // Trim spaces to avoid incorrect paths
          
        }).promise();

        if (!s3Object.Body) {
          console.warn(`Skipping file ${doc.file_path} because it has no content`);
          continue;
        }

        archive.append(Buffer.from(s3Object.Body as Buffer), { name: doc.document_type });
      } catch (error) {
        console.error(`Error fetching file from S3: ${doc.file_path}`, error);
      }
    }

    archive.finalize();
  }
}
