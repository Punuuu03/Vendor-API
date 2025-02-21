import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { Document } from '../documents/entities/documents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}
