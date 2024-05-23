import { Injectable } from "@nestjs/common";
import { Department, Group, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { RatingUrlType, SelfRatingType } from "./rating.types";

@Injectable()
export class RatingService {
    constructor(
        private prisma: PrismaService
    ) { }

    async buildSelfRatingResponse(user: User) {
        let response = {};

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const dbGoals = await this.prisma.goal.findFirst({
            where: {
                month: {
                    gte: new Date(year, month, 1),
                    lte: new Date(year, month + 1, 0),
                },
            },
        });

        response["goals"] = {
            quantity: Math.round(dbGoals.quantityPercent / 100 * 1100),
            quality: Math.round(dbGoals.qualityPercent) / 10,
        }

        const transcribedCalls = await this.prisma.transcribedCall.findMany({
            where: {
                crmId: user.crmId,
                date: {
                    gte: new Date(year, month, 1),
                    lte: new Date(year, month + 1, 0),
                },
            }
        });

        const procceedCalls = transcribedCalls.reduce((accumulator, currentValue) => {
            accumulator.qualitySum += currentValue.qualityPercent;
            accumulator.count++;
            return accumulator;
        }, { qualitySum: 0, count: 0 });

        response["values"] = {
            quality: Math.round(procceedCalls.qualitySum / procceedCalls.count) / 10,
            quantity: Math.round(procceedCalls.count),
        }

        const qualitySatisfaction = response["values"]["quality"] / response["goals"]["quality"];
        const quantitySatisfaction = response["values"]["quantity"] / response["goals"]["quantity"];

        response["values"]["average"] = Math.round((qualitySatisfaction + quantitySatisfaction) / 2 * 1000) / 10;

        const baseBonus = response["values"]["average"] > 75 ? (response["values"]["average"] - 75) * 2 : 0;

        response["bonuses"] = {
            quality: Math.round(baseBonus * qualitySatisfaction / (quantitySatisfaction + quantitySatisfaction) * 10) / 10,
            quantity: Math.round(baseBonus * quantitySatisfaction / (quantitySatisfaction + quantitySatisfaction) * 10) / 10,
            experience: today.getMonth() - user.startDate.getMonth(),
        };

        return response as SelfRatingType;
    }

    async buildGlobalRatingResponse(user: User, globalType: RatingUrlType) {

        let response = [];

        if (globalType == "employees") {
            const usersInGroup = await this.prisma.user.findMany({
                where: {
                    groupId: user.groupId,
                    role: "EMPLOYEE",
                }
            });

            console.log(usersInGroup)

            for (const user of usersInGroup) {
                const userRating = await this.buildSelfRatingResponse(user);
                if (!isNaN(userRating.values.average)) {
                    const userResult = {
                        title: `${user.name} ${user.surname}`,
                        value: userRating.values.average,
                    };
                    response.push(userResult);
                }
            }
        } else if (globalType == "group") {
            const groups: Group[] = await this.prisma.group.findMany({
                where: {
                    department: user.department,
                }
            });

            for (const group of groups) {
                const usersInGroup = await this.prisma.user.findMany({
                    where: {
                        groupId: {
                            in: groups.map(group => group.id),
                        },
                        role: "EMPLOYEE",
                    }
                });

                const userRatings: SelfRatingType[] = await Promise.all(usersInGroup.map(async (user) => await this.buildSelfRatingResponse(user)));

                const procceedRatings = userRatings.reduce((accumulator, currentValue) => {
                    if (!isNaN(currentValue.values.average)) {
                        accumulator.averageSum += currentValue.values.average;
                        accumulator.count++;
                    }
                    return accumulator;
                }, { averageSum: 0, count: 0 });

                const groupResult = {
                    title: group.title,
                    value: procceedRatings.averageSum / procceedRatings.count,
                }

                response.push(groupResult);
            }
        } else if (globalType == "department") {

            const departments = ["SERVICE", "REFERENCE"];

            for (const department of departments) {

                const usersInDepartment = await this.prisma.user.findMany({
                    where: {
                        department: department as Department,
                        role: "EMPLOYEE",
                    }
                });

                console.log(usersInDepartment)

                if (usersInDepartment.length > 0) {
                    const userRatings: SelfRatingType[] = await Promise.all(usersInDepartment.map(async (user) => await this.buildSelfRatingResponse(user)));
    
                    const procceedRatings = userRatings.reduce((accumulator, currentValue) => {
                        if (!isNaN(currentValue.values.average)) {
                            accumulator.averageSum += currentValue.values.average;
                            accumulator.count++;
                        }
                        return accumulator;
                    }, { averageSum: 0, count: 0 });
    
                    const departmentResult = {
                        title: department == "REFERENCE" ? "Справочно-информационный отдел" : "Отдел ключевых направлений обслуживания",
                        value: procceedRatings.averageSum / procceedRatings.count,
                    }
    
                    response.push(departmentResult);
                }

            }
        }
        return response.sort((a, b) => b.value - a.value);
    }

}