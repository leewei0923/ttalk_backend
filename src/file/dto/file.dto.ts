import { IsNotEmpty } from 'class-validator';

export class uploadDto {
  @IsNotEmpty()
  fieldname: string;

  @IsNotEmpty()
  originalname: string;

  @IsNotEmpty()
  encoding: string;

  @IsNotEmpty()
  mimetype: string;

  @IsNotEmpty()
  buffer: Buffer;

  @IsNotEmpty()
  size: number;
}
