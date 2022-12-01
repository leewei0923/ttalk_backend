import { IsNotEmpty } from 'class-validator';

export class InsetCollectDto {
  @IsNotEmpty()
  collect_id: string;

  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  origin: string;

  @IsNotEmpty()
  type: string;
}

export class DelectCollectDto {
  @IsNotEmpty()
  collect_id: string;

  @IsNotEmpty()
  account: string;
}

export class UpdateCollectDto {
  @IsNotEmpty()
  collect_id: string;

  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  content: string;
}
