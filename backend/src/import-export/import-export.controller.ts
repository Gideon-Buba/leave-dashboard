import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';

@Controller()
export class ImportExportController {
  constructor(private readonly service: ImportExportService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.service.importFile(file);
  }

  @Get('export')
  async exportFile(@Res() res: Response) {
    return this.service.exportXlsx(res);
  }
}
