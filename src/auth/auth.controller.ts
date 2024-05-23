import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshTokenGuard } from './jwt-refresh-token.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from '@prisma/client';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { CreateUserDto, createUserSchema } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('/users/groups')
  @UseGuards(JwtAuthGuard)
  async getAllowedGroups(@Req() req: any) {
    console.log("FUCK YOU", req.user)
    return await this.authService.getAllowedGroups(req.user);
  }

  @Get('/users/:group')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Req() req: any, @Param('group') groupId: number) {
    return await this.authService.getAllUsersByGroup(req.user, Number(groupId));
  }

  @Get('/groups')
  @UseGuards(JwtAuthGuard)
  async getAllGroups(@Req() req: any) {
    return this.authService.getAllGroups(req.user);
  }

  @Post()
  @UseGuards(LocalAuthGuard)
  async auth(@Req() req: any, @Res() res: any) {
    const { accessToken, refreshToken } = await this.authService.buildLoginResponse(req.user);
    res.setHeader('Set-Cookie', [
      `accessToken=${accessToken}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=${+process.env.JWT_ACCESS_EXPIRATION_TIME}`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=${+process.env.JWT_REFRESH_EXPIRATION_TIME}`,
    ]);
    return res.status(200).json(await this.authService.buildProfileResponse(req.user));
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.authService.buildProfileResponse(req.user);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async checkAccessToken(@Req() req: any) {
    const user: User = req.user;
    return await this.authService.buildProfileResponse(user);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshTokenGuard)
  async refreshToken(@Req() req: any) {
    const [authType, authJwtToken] = req.headers.authorization.split(' ');
    if (authType != 'Bearer') {
      throw new UnprocessableEntityException();
    }
    return await this.authService.buildRefreshResponse(
      req.user,
      authJwtToken.trim(),
    );
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createNewUser(@Req() req: any, @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto) {
    const response = await this.authService.buildCreateUserResponse(req.user, createUserDto);
    return response;
  }
}
