import { Department, UserRole } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
    login: z.string().trim().min(1).regex(/[a-zA-Z0-9]{8,16}/gmi),
    password: z.string().trim().regex(/[a-zA-Z0-9]{8,16}/gmi),
    name: z.string().trim().regex(/[а-яА-Я\sўіA-Za-z]{2,64}/gmi),
    surname: z.string().trim().regex(/[а-яА-Я\sўіA-Za-z]{2,64}/gmi),
    crmId: z.string().trim().regex(/\d\d\d-\d\d\d/gmi),
    role: z.nativeEnum(UserRole),
    isSenior: z.boolean(),
    groupId: z.number().int(),
    department: z.nativeEnum(Department),
}).required();

export type CreateUserDto = Required<z.infer<typeof createUserSchema>>

export const authUserSchema = z.object({
    username: z.string().trim().min(1).regex(/[a-zA-Z0-9]{8,16}/gmi),
    password: z.string().trim().regex(/[a-zA-Z0-9]{8,16}/gmi),
}).required();

export type AuthUserDto = Required<z.infer<typeof authUserSchema>>