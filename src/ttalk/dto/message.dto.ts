import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SaveMessageDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  user_account: string;

  @IsNotEmpty()
  friend_account: string;

  @IsNotEmpty()
  mood_state: string;

  @IsNotEmpty()
  message_style: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  read_flag: boolean;
}

export class updateFlagDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  id: string[] | string;

  @IsNotEmpty()
  user_account: string;

  @IsNotEmpty()
  friend_account: string;
}
