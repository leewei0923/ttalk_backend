import { IsNotEmpty } from 'class-validator';

export class UpdateDto {
  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  bird_date: string;

  @IsNotEmpty()
  social: string;

  @IsNotEmpty()
  motto: string;
}
