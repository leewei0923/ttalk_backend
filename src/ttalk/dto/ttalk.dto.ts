import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddFriendDto {
  @ApiProperty()
  @IsNotEmpty()
  user_account: string; // 申请人账号

  @IsNotEmpty()
  friend_account: string; // 被申请人账号

  @IsNotEmpty()
  verifyInformation?: string; // 验证信息

  @IsNotEmpty()
  remark?: string;

  @IsNotEmpty()
  blacklist?: boolean;

  @IsNotEmpty()
  tags: string;

  @IsNotEmpty()
  type: 'apply' | 'accept' | 'black';
}

/**
 * 验证账号的登录状态
 */
export class checkOnlineDto {
  @ApiProperty()
  @IsNotEmpty()
  type: 'get';

  @IsNotEmpty()
  to_account: string[];
}
