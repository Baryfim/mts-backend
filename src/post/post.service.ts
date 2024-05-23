import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Group, Post, PostCategory, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async getPostsByCategoryId(user: User, categoryId: number) {
        const category: PostCategory & {
            group: Group[],
            posts: Post[]
        } = await this.prismaService.postCategory.findFirst({
            where: {
                id: categoryId,
            },
            include: {
                posts: true,
                group: true
            }
        });

        if (!category.group.map(gr => gr.id).includes(user.groupId)) {
            throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN)
        }
        return category;
    }
}
