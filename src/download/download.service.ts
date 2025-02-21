import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    // 1️⃣ Fetch Document from Database
    const document = await this.documentRepository.findOne({ where: { document_id: documentId } });
    if (!document) throw new NotFoundException('Document not found');

    if (!document.documents || document.documents.length === 0) {
      throw new NotFoundException('No documents available for download');
    }

    // 2️⃣ Setup Response Headers for ZIP Download
    const zipFileName = `${document.name.replace(/\s+/g, '_')}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

    // 3️⃣ Initialize Archiver for ZIP Creation
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    try {
      // 4️⃣ Fetch Files from S3 and Append to ZIP
      for (const doc of document.documents) {
        const s3Key = doc.file_path.trim(); // Ensure trimmed path
        try {
          const s3Object = await this.s3.getObject({
            Bucket: 'vendorpunam',
            Key: s3Key,
          }).promise();

          if (s3Object.Body) {
            archive.append(s3Object.Body as Buffer, { name: doc.document_type });
          } else {
            console.warn(`⚠️ Skipped empty file from S3: ${s3Key}`);
          }
        } catch (err) {
          console.error(`❌ Error fetching file from S3: ${s3Key}`, err);
        }
      }

      // 5️⃣ Finalize the ZIP after All Files Are Appended
      archive.finalize();

      // 6️⃣ Handle ZIP Completion
      archive.on('end', () => {
        console.log('✅ ZIP file has been sent successfully.');
      });

      // 7️⃣ Handle Archiver Warnings
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('⚠️ Archiver Warning:', err.message);
        } else {
          throw err;
        }
      });

      // 8️⃣ Handle Archiver Errors
      archive.on('error', (err) => {
        console.error('❌ Archiver Error:', err);
        throw new InternalServerErrorException('Failed to create ZIP archive');
      });

    } catch (err) {
      console.error('❌ Error during download process:', err);
      throw new InternalServerErrorException('Failed to download documents');
    }
  }
}
