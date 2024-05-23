import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RatingService } from "./rating.service";
import { RatingUrlType } from "./rating.types";

@Controller('rating')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    @Get("/self")
    @UseGuards(JwtAuthGuard)
    async getSelfRating(@Req() req: any) {
        const response = await this.ratingService.buildSelfRatingResponse(req.user);
        return response;
    }

    @Get("/global/:type")
    @UseGuards(JwtAuthGuard)
    async getGlobalRating(@Req() req: any, @Param("type") globalType: RatingUrlType) {
        const response = await this.ratingService.buildGlobalRatingResponse(req.user, globalType);
        return response;
    }
}