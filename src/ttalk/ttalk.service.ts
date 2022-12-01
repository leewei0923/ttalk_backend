import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { encryptPassword, makeSalt } from '../utils/cryptogram';
import { ttalk_user } from './entities/ttalk.entity.mysql';
import { AuthService } from 'src/auth/auth.service';
import { UpdateDto } from './dto/update.dto';
import {
  AddFriendDto,
  checkOnlineDto,
  getAndUpdateDto,
  LoadLatestMessageDto,
  LoadUnReadDto,
  PullInBlacklist,
} from './dto/ttalk.dto';
import { ttalk_user_concat } from './entities/user_concat.entity.mysql';
import dayjs from 'dayjs';
import { ttalk_online } from './entities/online.entity.mysql';
import { SaveMessageDto, updateFlagDto } from './dto/message.dto';
import { message_record } from './entities/message_record.entity.mysql';
import { offline_events_record } from './entities/offline_events_record.entity.mysql';
import { collect_record } from './entities/collect_record.entity.mysql';
import {
  DelectCollectDto,
  InsetCollectDto,
  UpdateCollectDto,
} from './dto/collect.dto';

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
    @Inject('MESSAGE_RECORD_REPOSITORY')
    private MessageRecordRepository: Repository<message_record>,
    @Inject('OFFLINE_EVENTS_RECORD_REPOSITORY')
    private OfflineEventRecordRepository: Repository<offline_events_record>,
    @Inject('COLLECT_RECORD_REPOSITORY')
    private CollectRecordRepository: Repository<collect_record>,
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
    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

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
      add_time: curDate,
      update_time: curDate,
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
    const { account, nickname, bird_date, social, motto, avatar } = data;

    const curTime = dayjs().format('YYYY-MM-DD HH:mm');
    try {
      await this.TTalkUserRepository.query(
        `UPDATE ttalk_user SET  nickname='${nickname}', bird_date='${bird_date}', social='${social}', motto='${motto}', avatar = '${avatar}', ip='${ip}', update_time = '${curTime}'  WHERE account='${account}'`,
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
    } catch (error) {
      console.log('查找出错', error);
    }
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
        await this.TTalkUserConcatRepository.save({
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
          type: 'apply',
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
    const { user_account, friend_account, remark } = info;
    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

    try {
      await this.TTalkUserConcatRepository.query(
        `UPDATE ttalk_user_concat SET friend_flag = true where friend_account = '${user_account}' and user_account = '${friend_account}'`,
      );

      await this.TTalkUserConcatRepository.save({
        user_account: user_account,
        friend_account: friend_account,
        friend_flag: true,
        verifyInformation: '',
        remark: remark,
        blacklist: false,
        tags: '',
        add_time: curDate,
        update_time: curDate,
        type: 'accept',
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   * 根据更新时间和账号更新账户信息
   */

  async getAndUpdateAccountInfo(data: getAndUpdateDto) {
    const { account, update_time } = data;

    try {
      const queryStr = `SELECT account,avatar, nickname, bird_date, social, motto, add_time, update_time FROM ttalk_user WHERE account = '${account}'`;

      const userInfo = await this.TTalkUserRepository.query(queryStr);

      if (userInfo) {
        if (userInfo[0].update_time !== update_time) {
          return {
            status: 'ok',
            code: 200,
            msg: '申请成功',
            userInfoData: userInfo,
          };
        } else {
          return {
            status: 'fail',
            code: 400,
            msg: '不需要更新',
            userInfoData: [],
          };
        }
      } else {
        return {
          status: 'fail',
          code: 400,
          msg: '不需要更新',
          userInfoData: [],
        };
      }
    } catch (error) {}
  }

  /**
   * 保存用户消息
   */

  saveFriendMessage(data: SaveMessageDto) {
    const {
      user_account,
      friend_account,
      mood_state,
      message,
      message_style,
      read_flag,
    } = data;

    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

    this.MessageRecordRepository.save({
      user_account,
      friend_account,
      mood_state,
      message,
      message_style,
      create_time: curDate,
      read_flag,
    }).catch((err) => {
      console.log('出错', err);
    });

    return {
      status: 'ok',
      code: '200',
      msg: '保存成功',
    };
  }

  /**
   * 更新阅读状态
   */
  async updateReadFlag(data: updateFlagDto) {
    const { id, user_account, friend_account } = data;

    if (Array.isArray(id)) {
      for (let i = 0; i < id.length; i++) {
        const queryCode = `UPDATE message_record SET read_flag = 'true' WHERE user_account = '${user_account}' AND friend_account = '${friend_account}' AND id = '${id[i]}'`;
        this.MessageRecordRepository.query(queryCode);
      }
    } else {
      const queryCode = `UPDATE message_record SET read_flag = 'true' WHERE user_account = '${user_account}' AND friend_account = '${friend_account}' AND id = '${id}'`;
      this.MessageRecordRepository.query(queryCode);
    }
  }

  /**
   * 拉进黑名单
   */
  async pullIntoBlacklist(data: PullInBlacklist) {
    const { user_account, friend_account } = data;

    const concatRes = await this.TTalkUserConcatRepository.findOne({
      where: {
        user_account,
        friend_account,
      },
    });

    if (typeof concatRes === 'object') {
      const queryCode = `UPDATE ttalk_user_concat SET blacklist = ${!concatRes.blacklist} WHERE user_account = '${user_account}' and friend_account = '${friend_account}'`;

      this.TTalkUserConcatRepository.query(queryCode);
    }

    return {
      code: 200,
      status: 'ok',
      msg: '更新状态成功',
      info: {
        friend_account,
        blacklist_status: !concatRes.blacklist,
      },
    };
  }

  /**
   * 删除好友
   */
  async DeleteFriend(data: PullInBlacklist) {
    const { user_account, friend_account } = data;

    const concatRes = await this.TTalkUserConcatRepository.findOne({
      where: {
        user_account,
        friend_account,
      },
    });

    if (typeof concatRes === 'object') {
      const queryCode = `DELETE ttalk_user_concat SET friend_flag = ${!concatRes.friend_flag} WHERE user_account = '${user_account}' and friend_account = '${friend_account}'`;

      this.TTalkUserConcatRepository.query(queryCode);
    }

    return {
      code: 200,
      status: 'ok',
      msg: '更新状态成功',
      info: {
        friend_account,
        friend_status: !concatRes.friend_flag,
      },
    };
  }

  /**
   * 加载最新的事件
   */

  async loadLatestEvent(account: string) {
    const res = await this.OfflineEventRecordRepository.find({
      where: {
        friend_account: account,
        end_flag: false,
      },
    });

    const queryCode = `UPDATE offline_events_record SET end_flag = true WHERE friend_account = '${account}'`;

    this.OfflineEventRecordRepository.query(queryCode);

    return {
      code: 200,
      msg: '加载成功',
      status: 'ok',
      info: res,
    };
  }

  /**
   * 加载最新消息
   */

  async loadLatestMessage(data: LoadLatestMessageDto) {
    const { user_account, friend_account, create_time } = data;

    const queryCode = `SELECT message_id, user_account, friend_account, mood_state, message_style, message, create_time, read_flag FROM  message_record WHERE user_account = '${user_account}' AND friend_account = '${friend_account}' AND create_time >= '${create_time}'`;
    const res = await this.MessageRecordRepository.query(queryCode);

    return {
      code: 200,
      msg: '加载成功',
      status: 'ok',
      info: res,
    };
  }

  /**
   * 加载所有未读消息,并重置为已读消息
   */
  async updateReadFlag2(data: LoadUnReadDto) {
    const { receive_account, send_account } = data;
    // 此处 send_account 为 friend_account

    const resObj = {
      send_account, // 对于接收方来说是friend
      receive_account,
      message_ids: [],
    };

    const unReadRes = await this.MessageRecordRepository.find({
      where: {
        user_account: send_account,
        friend_account: receive_account,
        read_flag: false,
      },
    });

    if (Array.isArray(unReadRes) && unReadRes.length > 0) {
      for (let i = 0; i < unReadRes.length; i++) {
        resObj.message_ids.push(unReadRes[i].message_id);
        const queryMessageCode = `UPDATE message_record SET read_flag = true WHERE friend_account = '${unReadRes[i].friend_account}' AND message_id = '${unReadRes[i].message_id}'`;
        this.MessageRecordRepository.query(queryMessageCode);
      }
    }

    return {
      code: 200,
      msg: '加载成功',
      status: 'ok',
      info: resObj,
    };
  }

  /**
   * 增加收藏
   */
  insertCollect(collectData: InsetCollectDto) {
    const curDate = dayjs().format('YYYY-MM-DD HH-mm');

    const { collect_id, account, content, origin, type } = collectData;
    this.CollectRecordRepository.save({
      collect_id,
      account,
      content,
      origin,
      type,
      create_time: curDate,
      update_time: curDate,
    });

    return {
      code: 200,
      msg: '保存成功',
      status: 'ok',
    };
  }
  /**
   * 删除收藏
   */

  deleteCollect(deleteData: DelectCollectDto) {
    const { account, collect_id } = deleteData;
    this.CollectRecordRepository.delete({
      account,
      collect_id,
    }).catch((err) => {
      console.log('删除出现错误', err);
    });

    return {
      code: 200,
      msg: '删除成功',
      status: 'ok',
    };
  }

  /**
   * 更新收藏
   */
  updateCollect(updateData: UpdateCollectDto) {
    const { account, collect_id, content } = updateData;
    const curDate = dayjs().format('YYYY-MM-DD HH-mm');

    this.CollectRecordRepository.update(
      {
        content,
        update_time: curDate,
      },
      { account, collect_id },
    );

    return {
      code: 200,
      msg: '更新成功',
      status: 'ok',
    };
  }
}
