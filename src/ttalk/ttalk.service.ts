import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { encryptPassword, makeSalt } from '../utils/cryptogram';
import { ttalk_user } from './entities/ttalk.entity.mysql';
import { AuthService } from 'src/auth/auth.service';
import { UpdateDto } from './dto/update.dto';
import { AddFriendDto, checkOnlineDto } from './dto/ttalk.dto';
import { ttalk_user_concat } from './entities/user_concat.entity.mysql';
import dayjs from 'dayjs';
import { ttalk_online } from './entities/online.entity.mysql';

@Injectable()
export class TtalkService {
  constructor(
    private readonly authService: AuthService,
    @Inject('TTALK_USER_REPOSITORY')
    private TTalkUserRepository: Repository<ttalk_user>,
    @Inject('TTALK_USER_CONCAT_REPOSITORY')
    private TTalkUserConcatRepository: Repository<ttalk_user_concat>,
    @Inject('TTALK_ONLINE_REPOSITORY')
    private TTalkOnlineRepository: Repository<ttalk_online>,
  ) {}

  async existUser(account: string): Promise<number> {
    const count = await this.TTalkUserRepository.count({
      where: { account: account },
    });
    return count;
  }

  async register(data: RegisterDto, ip: string) {
    // 检查是否存在已有的账号
    const userCount = await this.existUser(data.account);

    if (userCount >= 1) {
      return {
        status: 'fail',
        code: 400,
        msg: '已存在该账号,重新选择',
      };
    }

    // 加密盐值用于登录账号验证
    const salt = makeSalt();
    this.TTalkUserRepository.save({
      account: data.account,
      password: encryptPassword(data.password, salt),
      salt: salt,
      ip: ip,
    });

    return {
      status: 'ok',
      code: 200,
      msg: '注册成功',
    };
  }

  async login(data: RegisterDto) {
    const saltRes = await this.TTalkUserRepository.findOne({
      select: ['salt'],
      where: {
        account: data.account,
      },
    });

    const date = new Date();
    const start_time = date.getTime();
    const end_time = date.getTime() + 846720000;
    const login_status = true;
    const { token } = await this.authService.validScanOpenid(data.account);

    if (saltRes === null) {
      return {
        status: 'fail',
        code: '400',
        msg: '登录失败,请检查账号',
      };
    }

    const userRes = await this.TTalkUserRepository.find({
      select: [
        'nickname',
        'avatar',
        'account',
        'openid',
        'bird_date',
        'motto',
        'social',
        'add_time',
        'ip',
      ],
      where: {
        account: data.account,
        password: encryptPassword(data.password, saltRes.salt),
      },
    });

    if (userRes[0] === undefined) {
      return {
        status: 'fail',
        code: '400',
        msg: '登录失败,请检查密码',
      };
    }

    return {
      status: 'ok',
      code: '200',
      msg: '登录成功',
      start_time: start_time,
      end_time: end_time,
      login_status: login_status,
      userInfo: userRes,
      token: token,
    };
  }

  /**
   * 更新信息
   */

  async updateInfo(data: UpdateDto, ip: string) {
    const { account, nickname, bird_date, social, motto } = data;
    try {
      await this.TTalkUserRepository.query(
        `UPDATE ttalk_user SET  nickname='${nickname}', bird_date='${bird_date}', social='${social}', motto='${motto}', ip='${ip}'  WHERE account='${account}'`,
      );

      return { code: 200, status: 'ok', msg: '更新成功' };
    } catch (error) {
      return { code: 400, status: 'fail', msg: '更新失败' };
    }
  }

  /**
   * 查找信息
   */
  async searchUser(name: string) {
    try {
      const res: any = await this.TTalkUserRepository.query(
        `SELECT nickname, motto , account, avatar FROM ttalk_user WHERE account = '${name}'`,
      );
      if (res.length > 0) {
        return {
          status: 'ok',
          code: 200,
          msg: '成功',
          user: res,
        };
      } else {
        return {
          status: 'ok',
          code: 200,
          msg: '没有找到该用户',
        };
      }
    } catch (error) {}
  }

  /**
   * 添加好友
   */

  async addFriend(info: AddFriendDto, ip: string) {
    const { type } = info;

    switch (type) {
      case 'apply':
        return this.#addFriendApply(info, ip);

      case 'accept':
        return this.#addFriendAccept(info);

      case 'black':
        break;
    }
  }

  async #addFriendApply(info: AddFriendDto, ip: string) {
    const { user_account, friend_account, verifyInformation, remark, tags } =
      info;
    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

    const searchUser = await this.TTalkUserConcatRepository.find({
      where: {
        user_account: user_account,
        friend_account: friend_account,
        friend_flag: false,
      },
      order: {
        update_time: 'desc',
      },
    });

    try {
      if (searchUser.length <= 0) {
        this.TTalkUserConcatRepository.save({
          user_account: user_account,
          friend_account: friend_account,
          add_time: curDate,
          update_time: curDate,
          friend_flag: false,
          verifyInformation: verifyInformation,
          remark: remark,
          blacklist: false,
          tags: tags,
          ip: ip,
        });
      } else {
        const query = `UPDATE ttalk_user_concat SET update_time = '${curDate}', verifyInformation = '${verifyInformation}', remark = '${remark}', tags = '${tags}' where id = '${searchUser[0].id}' and user_account = '${searchUser[0].user_account}' `;

        this.TTalkUserConcatRepository.query(query);
      }
    } catch (error) {
      console.log('error: ', error);
    }

    return {
      status: 'ok',
      code: 200,
      msg: '申请成功',
    };
  }

  async #addFriendAccept(info: AddFriendDto) {
    const { user_account, friend_account } = info;

    try {
      await this.TTalkUserConcatRepository.query(
        `UPDATE ttalk_user_concat SET friend_flag='${true}' where friend_flag = '${user_account}' and user_account = '${friend_account}'`,
      );

      await this.TTalkUserConcatRepository.save({
        user_account: user_account,
        friend_account: friend_account,
        friend_flag: true,
        verifyInformation: '',
        remark: '',
        blacklist: false,
        tags: '',
      });

      return {
        status: 'ok',
        code: 200,
        msg: '申请成功',
      };
    } catch (error) {
      console.log(error);
    }
  }
  // ================================

  /**
   * 加载用户的登录状态
   */

  async loadAccountStatus(data: checkOnlineDto, _ip: string) {
    if (data.type === 'get' && Array.isArray(data.to_account)) {
      const status = [];

      for (let i = 0; i < data.to_account.length; i++) {
        const userStatus = {};
        const lineRes = await this.TTalkOnlineRepository.find({
          where: {
            account: data.to_account[i],
            onlineFlag: true,
          },
          order: {
            update_time: 'desc',
          },
        });

        if (lineRes.length > 0) {
          userStatus['account'] = data.to_account[i];
          userStatus['status'] = 'online';
        } else {
          userStatus['account'] = data.to_account[i];
          userStatus['status'] = 'offline';
        }

        status.push(userStatus);
      }

      return {
        code: 200,
        msg: '在线登录',
        status: 'ok',
        account_status: status,
      };
    }

    return {
      code: 400,
      msg: '获取失败',
      status: 'fail',
    };
  }
}
