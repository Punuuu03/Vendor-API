import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error('Missing AWS_S3_BUCKET_NAME in environment variables');
    }

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_S3_ENDPOINT, // ✅ Ensure endpoint is set
      signatureVersion: 'v4', // ✅ Ensures proper signing
      s3ForcePathStyle: true, // ✅ Fixes incorrect bucket URL formats
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      console.log(`📤 Uploading to S3: Bucket=${this.bucketName}, Key=${params.Key}`);

      const uploadResult = await this.s3.upload(params).promise();
      console.log(`✅ Upload Successful: ${uploadResult.Location}`);

      return uploadResult.Location; // ✅ Return S3 URL
    } catch (error) {
      console.error('❌ S3 Upload Error:', error);
      throw new InternalServerErrorException('S3 upload failed');
    }
  }
}
