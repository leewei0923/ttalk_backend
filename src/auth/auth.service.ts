import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // JWT验证 - Step 2: 校验用户信息
  async validScanOpenid(openid: string) {
    const date = new Date();

    const payload = {
      openid: openid,
      time: date.getTime(),
    };

    if (payload) {
      try {
        const token = this.jwtService.sign(payload);
        return {
          code: 200,
          token,
          status: true,
          msg: `登录成功`,
        };
      } catch (error) {
        return {
          code: 500,
          msg: `登录出错`,
        };
      }
    }
  }

  // JWT验证 - Step 3: 处理 jwt 签证
  async certificate(user: any) {
    const payload = {
      username: user.username,
      sub: user.userId,
      realName: user.realName,
      role: user.role,
    };
    console.log('JWT验证 - Step 3: 处理 jwt 签证');
    try {
      const token = this.jwtService.sign(payload);
      return {
        code: 200,
        token,

        msg: `登录成功`,
      };
    } catch (error) {
      return {
        code: 600,
        msg: `账号或密码错误`,
      };
    }
  }
}
