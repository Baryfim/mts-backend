
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserCredentials } from './auth.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(dto: AuthUserCredentials): Promise<any> {
    const user = await this.authService.authUser({
        login:dto.login,
        password:dto.password,
        
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
