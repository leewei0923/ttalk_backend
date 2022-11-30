import { Inject } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { ttalk_online } from './entities/online.entity.mysql';
import { ttalk_user } from './entities/ttalk.entity.mysql';
import { ttalk_user_concat } from './entities/user_concat.entity.mysql';
import { addFriendType } from 'src/types';
import { readFeedbackDto, SaveMessageDto } from './dto/message.dto';
import { message_record } from './entities/message_record.entity.mysql';
import { offline_events_record } from './entities/offline_events_record.entity.mysql';
import { OfflineEventsName } from './types';

@WebSocketGateway(3102, { cors: true })
export class EventsGateway {
  constructor(
    @Inject('TTALK_USER_REPOSITORY')
    private TTalkUserRepository: Repository<ttalk_user>,
    @Inject('TTALK_USER_CONCAT_REPOSITORY')
    private TTalkUserConcatRepository: Repository<ttalk_user_concat>,
    @Inject('TTALK_ONLINE_REPOSITORY')
    private TTalkOnlineRepository: Repository<ttalk_online>,
    @Inject('MESSAGE_RECORD_REPOSITORY')
    private MessageRecordRepository: Repository<message_record>,
    @Inject('OFFLINE_EVENTS_RECORD_REPOSITORY')
    private EventRecordRepository: Repository<offline_events_record>,
  ) {}

  @WebSocketServer() server: Server;

  // 当socket初始连接的时候
  async handleConnection(client: Socket): Promise<string> {
    const onlineId = client.id;
    const time = dayjs().format('YYYY-MM-DD HH:mm');
    const account: any = client.handshake.query.account;

    const curtime = Date.now();
    const data = await this.TTalkOnlineRepository.find({
      where: { account: account, onlineFlag: false, update_time: time },
      order: {
        update_time: 'DESC',
      },
    });

    if (data.length > 0) {
      const { add_time, id } = data[0];

      if (curtime - new Date(data[0].update_time).getTime() < 86400000) {
        this.#handleOnline(
          'update',
          account,
          onlineId,
          true,
          add_time,
          time,
          id,
        );
        return;
      }
    }

    if (onlineId) {
      this.#handleOnline('add', account, onlineId, true, time, time);
    }
    return '';
  }

  /**
   *私有方法添加和更新用户
   * @param type
   * @param account
   * @param online_id
   * @param onlineFlag
   * @param add_time
   * @param update_time
   * @param id 可选
   * @returns
   */
  async #handleOnline(
    type: 'add' | 'update',
    account: string,
    online_id: string,
    onlineFlag: boolean,
    add_time: string,
    update_time: string,
    id?: number,
  ) {
    if (type === 'add') {
      // 避免出现多个在线的情况
      this.TTalkOnlineRepository.findOne({
        where: {
          account,
          onlineFlag: true,
        },
      }).then((res) => {
        if (typeof res === 'object' && res?.online_id) {
          this.TTalkOnlineRepository.query(
            `UPDATE ttalk_online SET onlineFlag = false WHERE account = '${account}' and online_id = '${res.online_id}'`,
          );
        }
      });

      const res = await this.TTalkOnlineRepository.save({
        account: account,
        online_id: online_id,
        onlineFlag: onlineFlag,
        add_time: add_time,
        update_time: update_time,
      });

      return res;
    } else {
      const query = `UPDATE ttalk_online SET onlineFlag = ${onlineFlag}, online_id = '${online_id}', update_time = '${update_time}' where account = '${account}' and id ='${id}'`;
      const res = await this.TTalkOnlineRepository.query(query);
      return res;
    }
  }

  /**
   * 添加好友
   * @param client
   * @param payload
   * @returns
   */

  @SubscribeMessage('addFriend')
  async handleMessage(client: Socket, payload: addFriendType): Promise<string> {
    const { type, user_account, friend_account } = payload;

    const online = await this.TTalkOnlineRepository.findOne({
      where: {
        account: friend_account,
        onlineFlag: true,
      },
    });

    if (type === 'apply') {
      const friend = await this.TTalkUserConcatRepository.find({
        select: {
          id: true,
          user_account: true,
          friend_account: true,
          add_time: true,
          update_time: true,
          friend_flag: true,
          verifyInformation: true,
          blacklist: true,
          tags: true,
          ip: true,
        },
        where: {
          user_account: user_account,
          friend_account: friend_account,
          friend_flag: false,
        },
        order: {
          update_time: 'desc',
        },
      });

      const userRes: any = await this.TTalkUserRepository.query(
        `SELECT id, social, ip,  nickname, motto , account, avatar, bird_date FROM ttalk_user WHERE account = '${user_account}'`,
      );

      if (online) {
        this.server.to(online.online_id).emit('addFriend', {
          type: 'apply',
          friends: friend[0],
          user: userRes[0],
        });
      } else {
        // 离线状态下添加好友的事件存储
        this.offlineEventsSave(
          user_account,
          friend_account,
          OfflineEventsName.APPLY,
        );
      }
    } else if (type === 'accept') {
      // 更新联系人身份关系
      const query = `UPDATE ttalk_user_concat SET friend_flag = true WHERE user_account = '${friend_account}' AND friend_account = '${user_account}'`;
      this.TTalkUserConcatRepository.query(query);

      if (online) {
        // 查找基础信息
        const userRes: any = await this.TTalkUserRepository.query(
          `SELECT id, social, ip,  nickname, motto , account, avatar, bird_date, add_time, update_time FROM ttalk_user WHERE account = '${user_account}'`,
        );

        this.server.to(online.online_id).emit('addFriend', {
          type: 'accept',
          friends: { friend_account: user_account },
          user: userRes[0],
        });
      } else {
        // 离线状态下的事件存储
        this.offlineEventsSave(
          user_account,
          friend_account,
          OfflineEventsName.ACCEPT,
        );
      }
    }
    return '';
  }

  /**
   * 断开连接
   * @param client
   * @returns
   */
  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket): Promise<void> {
    const onlineId = client.id;
    const curtime = Date.now();
    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

    const data = await this.TTalkOnlineRepository.find({
      where: { online_id: onlineId, onlineFlag: true },
    });

    if (data.length <= 0) return;

    const { id, account, add_time } = data[0];

    if (curtime - new Date(data[0].update_time).getTime() > 10000) {
      this.#handleOnline(
        'update',
        account,
        onlineId,
        false,
        add_time,
        curDate,
        id,
      );
    } else {
    }
  }

  /**
   * 收到消息，发送给接收方
   */
  @SubscribeMessage('messaging')
  async handleMessing(client: Socket, payload: SaveMessageDto) {
    const {
      remote_id,
      user_account,
      friend_account,
      message,
      mood_state,
      message_style,
      read_flag,
    } = payload;
    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

    // 先查询是否在线,在线将信息存入数据库,然后把信息发送给朋友
    // 离线状态,保存数据,将信息存入离线记录

    // 自己给自己发送的消息只保存处理
    if (user_account !== friend_account) {
      const onlineFriendRes = await this.TTalkOnlineRepository.find({
        where: {
          account: friend_account,
          onlineFlag: true,
        },
      });

      if (onlineFriendRes.length > 0) {
        for (let i = 0; i < onlineFriendRes.length; i++) {
          const to_friend_message = {
            user_account: payload.friend_account,
            friend_account: payload.user_account,
            message: payload.message,
            mood_state: payload.mood_state,
            message_style: payload.message_style,
            read_flag: payload.read_flag,
            message_id: remote_id,
            create_time: curDate,
            update_time: curDate,
          };

          this.server
            .to(onlineFriendRes[i].online_id)
            .emit('messaging', to_friend_message);
        }
      } else {
        // 离线信息存储
        this.offlineEventsSave(
          user_account,
          friend_account,
          OfflineEventsName.MESSAGING,
        );
      }
    }

    // 将信息存入数据库
    this.MessageRecordRepository.save({
      message_id: remote_id,
      user_account,
      friend_account,
      mood_state,
      message_style,
      message,
      read_flag,
      create_time: curDate,
    });
  }

  /**
   * 用于离线事件存储
   * @param user_account 发送方
   * @param friend_account 接收方
   * @param event 事件类型
   * @param end_flag 事件结束标志
   */
  private offlineEventsSave(
    user_account: string,
    friend_account: string,
    event: OfflineEventsName,
    end_flag?: boolean,
    event_detail?: string,
  ) {
    const curDate = dayjs().format('YYYY-MM-DD HH:mm');

    console.log(user_account, friend_account, event, end_flag, event_detail);

    this.EventRecordRepository.findOne({
      where: {
        user_account,
        friend_account,
        end_flag: false,
        event_type: event,
      },
    }).then((res) => {
      // 传入end_flag 不需要执行后续的程序
      if (typeof end_flag === 'boolean') {
        const queryCode = `UPDATE offline_events_record SET end_flag = ${end_flag} where user_account = '${res.user_account}' AND friend_account = '${res.friend_account}' AND id = '${res.id}'`;
        this.EventRecordRepository.query(queryCode);

        return;
      }

      // 如果查找到已经存在的消息，更新update否则更新时间
      if (res === null) {
        this.EventRecordRepository.save({
          user_account,
          friend_account,
          event_type: event,
          create_time: curDate,
          update_time: curDate,
          end_flag: false,
          event_detail,
        });
      } else {
        let newObj = event_detail;
        console.log(res);
        if (typeof event_detail === 'string') {
          const obj: any = JSON.parse(event_detail);
          const obj2: any = JSON.parse(res.event_detail);

          if (obj.type === 'read' && obj2.type === 'read') {
            obj2.message_id.push(...obj.message_id);
            newObj = JSON.stringify(obj2);
          }
        }

        const queryCode = `UPDATE offline_events_record SET update_time = '${curDate}', event_detail = '${newObj}' where user_account = '${res.user_account}' AND friend_account = '${res.friend_account}' AND id = '${res.id}'`;
        this.EventRecordRepository.query(queryCode);
      }
    });
  }

  /**
   * 阅读消息反馈
   */
  @SubscribeMessage('read')
  async handleReadFeedback(client: Socket, payload: readFeedbackDto) {
    /**
     * 消息接收方(friend_account)发送阅读反馈给消息的发送方(user_account),消息接收方在本地更改阅读反馈的同时,
     * 也发送到服务器,通知消息发送方更改,如果是离线加入离线事件,在线直接通过socket.
     */

    const { send_account, receive_account, remote_id } = payload;

    const queryCode = `UPDATE message_record SET read_flag = true WHERE message_id = '${remote_id}' AND user_account = '${receive_account}' AND friend_account = '${send_account}'`;
    this.MessageRecordRepository.query(queryCode);

    // 发送反馈给消息发送方
    const onlineFriendRes = await this.TTalkOnlineRepository.find({
      where: {
        account: receive_account,
        onlineFlag: true,
      },
    });

    // 在线
    if (onlineFriendRes.length > 0) {
      this.server.to(onlineFriendRes[0].online_id).emit('read', {
        send_account,
        receive_account,
        message_ids: payload.remote_id,
      });
    } else {
      const messList = {
        type: 'read',
        message_id: [],
      };
      messList.message_id.push(payload.remote_id);
      console.log(messList);

      this.offlineEventsSave(
        send_account,
        receive_account,
        OfflineEventsName.READ,
        undefined,
        JSON.stringify(messList),
      );
    }
  }
}
