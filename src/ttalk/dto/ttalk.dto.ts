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

/**
 * 根据更新时间和账号更新账户信息
 * 2022-11-14
 */

export class getAndUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  update_time: string;
}

/**
 * 拉入黑名单
 */

export class PullInBlacklist {
  @ApiProperty()
  @IsNotEmpty()
  user_account: string; // 申请人账号

  @IsNotEmpty()
  friend_account: string; // 被申请人账号

  @IsNotEmpty()
  blacklist?: boolean;
}

/**
 * 查找用户的信息
 */

export class LoadLatestMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  user_account: string; // 申请人账号

  @IsNotEmpty()
  friend_account: string; // 被申请人账号

  @IsNotEmpty()
  create_time: string;
}
