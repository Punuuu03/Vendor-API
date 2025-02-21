import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get(':document_id')
  async downloadDocuments(@Param('document_id') documentId: number, @Res() res: Response) {
    return this.downloadService.downloadDocuments(documentId, res);
  }
}
