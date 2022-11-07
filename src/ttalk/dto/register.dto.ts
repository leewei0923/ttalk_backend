import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  origin: string;
}
