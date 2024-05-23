import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';

@Module({
    imports: [],
    controllers: [RatingController],
    providers: [RatingService, PrismaService],
    exports: [RatingService],
})
export class RatingModule { }