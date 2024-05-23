import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get('/posts/:id')
    @UseGuards(JwtAuthGuard)
    async getPostsByCategoryId(@Param("id") id: number, @Req() req: any) {
        return this.postService.getPostsByCategoryId(req, id);
    }
}
