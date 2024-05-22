import { User } from "@prisma/client";

export type CreateUserCredentials = Omit<User, 'id' | 'refreshTokens' | 'posts' | 'readState'>;
export type AuthUserCredentials = Omit<CreateUserCredentials, 'department'>;
export type AuthUserJwtCredentials = { login: string, password: string };
export type AuthUserCredentialsPartitial = Partial<Omit<AuthUserCredentials, 'login' | 'password'>> & AuthUserJwtCredentials;