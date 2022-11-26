import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RegEXPValid, LengthValid } from '../utils/valid';
import { IpAddress } from 'src/comm/request/ip';
import { RegisterDto } from './dto/register.dto';
import { TtalkService } from './ttalk.service';
import { UpdateDto } from './dto/update.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  AddFriendDto,
  checkOnlineDto,
  getAndUpdateDto,
  PullInBlacklist,
} from './dto/ttalk.dto';
import { SaveMessageDto, updateFlagDto } from './dto/message.dto';

@Controller('/server/ttalk')
export class TtalkController {
  constructor(private readonly ttalkService: TtalkService) {}

  // 注册账号

  @Post('/register')
  register(@Body() data: RegisterDto, @IpAddress() ip: string) {
    const { account, password, origin } = data;
    const eng_reg = /^[A-Za-z0-9]+$/g;

    if (
      origin !== 'ttalk' ||
      !RegEXPValid(eng_reg, account) ||
      !RegEXPValid(eng_reg, password)
    ) {
      return {
        status: 'fail',
        code: 400,
        msg: '注册失败',
      };
    } else if (!LengthValid(account, 5, 16)) {
      return {
        status: 'fail',
        code: 400,
        msg: '用户名长度小于5或者大于16',
      };
    } else if (!LengthValid(password, 8, 20)) {
      return {
        status: 'fail',
        code: 400,
        msg: '密码长度小于8或者大于20',
      };
    }

    return this.ttalkService.register(data, ip);
  }

  // 登录账号
  @Post('/login')
  login(@Body() data: RegisterDto) {
    const { account, password, origin } = data;
    const eng_reg = /^[A-Za-z0-9]+$/g;
    if (
      origin !== 'ttalk' ||
      !RegEXPValid(eng_reg, account) ||
      !RegEXPValid(eng_reg, password)
    ) {
      return {
        status: 'fail',
        code: 400,
        msg: '登录失败',
      };
    } else if (!LengthValid(account, 5, 16)) {
      return {
        status: 'fail',
        code: 400,
        msg: '用户名长度小于5或者大于16',
      };
    } else if (!LengthValid(password, 8, 20)) {
      return {
        status: 'fail',
        code: 400,
        msg: '密码长度小于8或者大于20',
      };
    }

    return this.ttalkService.login(data);
  }

  @Post('/updateInfo')
  updateUserInfo(@Body() data: UpdateDto, @IpAddress() ip: string) {
    return this.ttalkService.updateInfo(data, ip);
  }

  /**
   * 查找用户
   */
  @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
  @Post('/searchUser')
  searchUser(@Body() data: { account: string }) {
    return this.ttalkService.searchUser(data.account);
  }

  /**
   * 添加好友
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/addFriend')
  addFriend(@Body() data: AddFriendDto, @IpAddress() ip: string) {
    return this.ttalkService.addFriend(data, ip);
  }

  /**
   * 加载用户的登录状态
   * @param data
   * @param ip
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/checkOnline')
  CheckOnline(@Body() data: checkOnlineDto, @IpAddress() ip: string) {
    return this.ttalkService.loadAccountStatus(data, ip);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/getAndUpdateInfo')
  getAndUpdateUserIfo(@Body() data: getAndUpdateDto) {
    return this.ttalkService.getAndUpdateAccountInfo(data);
  }

  /** 消息存储 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/saveNewMessage')
  saveNewMessage(@Body() data: SaveMessageDto) {
    return this.ttalkService.saveFriendMessage(data);
  }

  /**
   * 更新阅读状态
   */
  /** 获取消息存储 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/updateMessageFlag')
  updateMessageFlag(@Body() data: updateFlagDto) {
    return this.ttalkService.updateReadFlag(data);
  }

  /**
   * 更新黑名单信息
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/updateConcatBlacklist')
  updateConcatBlacklist(@Body() data: PullInBlacklist) {
    if (typeof data.blacklist === 'boolean') {
      return this.ttalkService.pullIntoBlacklist(data);
    } else {
      return {
        code: 400,
        status: 'fail',
        msg: '更新状态失败',
      };
    }
  }

  /**
   * 更新黑名单信息
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/deleteFriend')
  updateConcatFriendFlag(@Body() data: PullInBlacklist) {
    if (typeof data.blacklist === 'boolean') {
      return this.ttalkService.DeleteFriend(data);
    } else {
      return {
        code: 400,
        status: 'fail',
        msg: '更新状态失败',
      };
    }
  }
}
