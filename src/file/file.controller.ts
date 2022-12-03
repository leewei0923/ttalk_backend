import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { uploadDto } from './dto/file.dto';
import { FileService } from './file.service';

@Controller('/server/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Post('uploadAvatar')
  @UseInterceptors(FileFastifyInterceptor('image'))
  uploadAvatarImage(@UploadedFile() file: uploadDto) {
    return this.fileService.uploadFile(file);
  }
}
