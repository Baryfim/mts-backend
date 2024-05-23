import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Department, Group, User, UserRole } from '@prisma/client';
import { AuthUserCredentialsPartitial, AuthUserJwtCredentials } from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prismaService: PrismaService
    ) { }

    async getUserWithJwt(token: string) {
        try {
            const decoded = await this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
            console.log(decoded)
            return await this.authUser(decoded);
        } catch (error) {
            console.error(error)
            return undefined;
        }
    }

    async getAllowedGroups(user: User) {
        console.log(user.role)
        console.log(UserRole.DEPARTMENT_HEAD == user.role)
        switch (user.role) {
            case UserRole.TEAM_LEADER:
                const group = await this.prismaService.user.findFirst({
                    where: {
                        groupId: user.groupId,
                    }
                });
                return [group];
            case UserRole.DEPARTMENT_HEAD:
                const allowedGroups = await this.prismaService.group.findMany({
                    where: {
                        department: user.department,
                    }
                });
                return allowedGroups;
            default:
                throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
        }
    }

    async getAllUsersByGroup(user: User, groupId: number) {
        switch (user.role) {
            case UserRole.TEAM_LEADER:
                if (user.groupId != groupId) {
                    throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
                }
                const usersL = await this.prismaService.user.findMany({
                    where: {
                        groupId: groupId,
                    },
                    include: {
                        group: true
                    }
                });
                return usersL.map(user => {
                    const userRole = (user.role == UserRole.DEPARTMENT_HEAD) ? "Руководитель отдела" : (user.role == UserRole.TEAM_LEADER) ? "Руководитель группы" : "Штатный сотрудник";
                    return Object.assign(user, {
                        role: userRole,
                        department: user.department == Department.REFERENCE ? "Справочно-информационный отдел" : "Отдел по работе с ключевыми клиентами",
                    })
                });
            case UserRole.DEPARTMENT_HEAD:
                const allowedGroups = await this.prismaService.group.findMany({
                    where: {
                        department: user.department,
                    }
                });
                if (!allowedGroups.map(gr => gr.id).includes(groupId)) {
                    throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
                }
                const usersD = await this.prismaService.user.findMany({
                    where: {
                        groupId: groupId,
                    },
                    include: {
                        group: true
                    }
                });
                return usersD.map(user => {
                    const userRole = (user.role == UserRole.DEPARTMENT_HEAD) ? "Руководитель отдела" : (user.role == UserRole.TEAM_LEADER) ? "Руководитель группы" : "Штатный сотрудник";
                    return Object.assign(user, {
                        role: userRole,
                        department: user.department == Department.REFERENCE ? "Справочно-информационный отдел" : "Отдел по работе с ключевыми клиентами",
                    })
                });
            default:
                throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN)
        }
    }

    async getAllGroups(user: User) {
        switch (user.role) {
            case "TEAM_LEADER":
                const groupsTeamLeader = await this.prismaService.group.findFirst({
                    where: {
                        id: user.groupId,
                    }
                });
                return groupsTeamLeader;
            case "DEPARTMENT_HEAD":
                const groupsDepartmentHead = await this.prismaService.group.findMany({
                    where: {
                        department: user.department,
                    }
                });
                return groupsDepartmentHead;
            default:
                throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN)
        }
    }

    async authUser(userCredentials: AuthUserCredentialsPartitial): Promise<any> {
        let user = await this.usersService.findOne(userCredentials.login, userCredentials.password);
        return user;
    }

    async buildCreateUserResponse(user: User, createUserDto: CreateUserDto) {
        let newUser = await this.usersService.findOne(createUserDto.login, createUserDto.password);
        if (!Boolean(newUser)) {
            if (user.department == createUserDto.department) {
                const userRole = user.role;
                if (userRole == UserRole.EMPLOYEE) {
                    throw new HttpException("You do not have rights to create users.", HttpStatus.UNAUTHORIZED);
                }
                else if (userRole == UserRole.TEAM_LEADER && (user.department != createUserDto.department || user.groupId != createUserDto.groupId)) {
                    throw new HttpException("You can not create users not in your group.", HttpStatus.UNAUTHORIZED);
                }
                else if (userRole == UserRole.DEPARTMENT_HEAD) {
                    const userGroups: Group[] = await this.usersService.getGroupsInDepartment(user.department);
                    if (userGroups.filter(group => group.id == createUserDto.groupId).length == 0) {
                        throw new HttpException("You can not create users not in your department.", HttpStatus.UNAUTHORIZED);
                    }
                }
                newUser = await this.usersService.createOne(createUserDto);
                return this.buildProfileResponse(newUser);
            }
        }
    }

    async buildJwtPayload(user: User) {
        const payload: AuthUserJwtCredentials = { login: user.login, password: user.password };
        return payload;
    }

    async buildLoginResponse(user: User) {
        return {
            accessToken: await this.getAccessToken(user),
            refreshToken: await this.getRefreshToken(user),
        };
    }

    async buildRefreshResponse(user: User, refreshToken: string) {
        return {
            accessToken: {
                token: await this.getAccessToken(user),
                maxAge: +process.env.JWT_ACCESS_EXPIRATION_TIME,
            },
            refreshToken: {
                token: await this.getRefreshToken(user, refreshToken),
                maxAge: +process.env.JWT_REFRESH_EXPIRATION_TIME
            },
            user: await this.buildProfileResponse(user),
        };
    }

    async getAccessToken(user: User) {
        return this.jwtService.sign(await this.buildJwtPayload(user), {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: +process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    async getRefreshToken(user: User, oldRefreshToken: string | null = null) {

        const newRefreshToken = this.jwtService.sign(await this.buildJwtPayload(user), {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: +process.env.JWT_REFRESH_EXPIRATION_TIME,
        });

        const savedTokenInDatabase = await this.usersService.updateRefreshTokens(user.login, user.password, oldRefreshToken, newRefreshToken);

        console.log("SAVED IN DB", savedTokenInDatabase)

        if (savedTokenInDatabase) {
            return newRefreshToken;
        }

        throw new UnauthorizedException();
    }

    async buildProfileResponse(user: User) {
        return this.usersService.buildUserResponse(user);
    }
}