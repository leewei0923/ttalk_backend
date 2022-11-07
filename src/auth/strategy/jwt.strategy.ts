import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { jwtConstants } from '../constats';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, // 使用密钥解析
    } as StrategyOptions);
  }

  //token验证, payload是super中已经解析好的token信息
  async validate(payload: any) {
    return { open: payload.openid };
  }
}
