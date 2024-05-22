import { Injectable } from '@nestjs/common';
import { Department, User } from '@prisma/client';
import { createHash } from 'crypto';
import { CreateUserDto } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) { }

  async findOne(login: string, password: string): Promise<User | null> {
    const user: User = await this.prisma.user.findFirst({
      where: {
        login,
        password
      }
    });

    return user;
  }

  async getGroupsInDepartment(department: Department) {
    const groups = await this.prisma.group.findMany({
      where: {
        department,
      }
    });
    return groups;
  }

  async createOne(data: CreateUserDto) {
    const user: User = await this.prisma.user.create({
      data,
    });

    return user;
  }

  async getHashedJwtToken(jwtToken: string): Promise<RefreshTokenHashed> {
    const now = Date.now();
    const expire = now + Number(process.env.JWT_REFRESH_EXPIRATION_TIME) * 1000;

    const encryptedJwtToken = createHash('sha256').update(jwtToken).digest('hex');
    return {
      hash: encryptedJwtToken,
      expire
    };
  }

  async updateRefreshTokens(login: string, password: string, oldRefreshToken: string, newRefreshToken: string) {
    const now = Date.now();

    const user: User = await this.findOne(login, password);
    let userRefreshTokens = user.refreshTokens as any;

    if (Boolean(userRefreshTokens)) {
      if (Boolean(oldRefreshToken)) {
        let oldRefreshTokenEncrypted = await this.getHashedJwtToken(oldRefreshToken);

        let oldRefreshTokenSaved = userRefreshTokens.filter(
          element => element.hash == oldRefreshTokenEncrypted.hash
        )?.[0] ?? null;
        if (!Boolean(oldRefreshTokenSaved)) {
          return false;
        }
        userRefreshTokens = userRefreshTokens.filter(element => element.hash !== oldRefreshTokenEncrypted.hash && element.expire > now);
      }
      userRefreshTokens = [await this.getHashedJwtToken(newRefreshToken), ...userRefreshTokens];
    }
    else {
      userRefreshTokens = [await this.getHashedJwtToken(newRefreshToken)];
    }

    await this.prisma.user.update({
      where: {
        login
      },
      data: {
        refreshTokens: userRefreshTokens,
      }
    });

    return true;
  }

  async buildUserResponse(user: User) {
    const { id, crmId, groupId, refreshTokens, ...userForFrontend } = user;
    return { ...userForFrontend };
  }
}