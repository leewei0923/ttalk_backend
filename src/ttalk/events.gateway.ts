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

@WebSocketGateway(3102, { cors: true })
export class EventsGateway {
  constructor(
    @Inject('TTALK_USER_REPOSITORY')
    private TTalkUserRepository: Repository<ttalk_user>,
    @Inject('TTALK_USER_CONCAT_REPOSITORY')
    private TTalkUserConcatRepository: Repository<ttalk_user_concat>,
    @Inject('TTALK_ONLINE_REPOSITORY')
    private TTalkOnlineRepository: Repository<ttalk_online>,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket): Promise<string> {
    const onlineId = client.id;
    const time = dayjs().format('YYYY-MM-DD HH:mm');
    const account: any = client.handshake.query.account;

    const curtime = Date.now();
    const data = await this.TTalkOnlineRepository.find({
      where: { account: account, onlineFlag: true },
      order: {
        update_time: 'DESC',
      },
    });

    if (Array.isArray(data) && typeof data[0] === 'object') {
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

    if (type === 'apply') {
      const user = await this.TTalkOnlineRepository.findOne({
        where: {
          account: friend_account,
          onlineFlag: true,
        },
      });

      if (user) {
        this.server
          .to(user.online_id)
          .emit('addFriend', { type: 'apply', friend_account: user_account });
      }
    }
    return 'hello';
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
}
