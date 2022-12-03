import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { resolve } from 'path';
import { uploadDto } from './dto/file.dto';

@Injectable()
export class FileService {
  async uploadFile(multipart: uploadDto) {
    const { buffer, originalname } = multipart;
    const nameList = originalname.split('-');

    const pathName = resolve(
      __dirname,
      '..',
      'file',
      nameList[0],
      nameList[1],
      nameList[2],
    );

    fs.stat(pathName, (err, stats: fs.Stats) => {
      if (!stats) {
        fs.mkdirSync(pathName, { recursive: true });
      }
    });

    //文件上传路径

    setTimeout(() => {
      const writerStream = fs.createWriteStream(pathName + '\\' + nameList[3]);

      writerStream.write(buffer);
      writerStream.end();
    }, 100);

    return {
      code: 200,
      status: 'ok',
      msg: '图片上传成功',
      url: `${nameList[0]}/${nameList[1]}/${nameList[2]}/${nameList[3]}`,
    };
  }
}
