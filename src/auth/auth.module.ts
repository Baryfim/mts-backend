import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersService } from "src/users/users.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.stretegy";
import { JwtRefreshStrategy } from "./jwt-refresh.stretegy";
import { PrismaService } from "src/prisma/prisma.service";
import { LocalStrategy } from "./local.strategy";

@Module({
    controllers: [AuthController],
    imports: [
        JwtModule.register({}),
    ],
    providers: [AuthService, PrismaService, UsersService, LocalStrategy, JwtStrategy, JwtRefreshStrategy]
})
export class AuthModule { }