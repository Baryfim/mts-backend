
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createHash } from 'crypto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(login: string, password: string): Promise<any> {
    console.log(login, password)
    const user = await this.authService.authUser({ login, password: createHash('sha256').update(password).digest('hex') });
    console.log({ login, password })
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
