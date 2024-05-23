export type RatingUrlType = "employees" | "group" | "department";
export type RatingTypesType = Record<RatingUrlType, string>;

export const ratingTypes: RatingTypesType = {
    "employees": "Рейтинг сотрудников",
    "group": "Рейтинг групп",
    "department": "Рейтинг отделов",
}

export type GlobalRatingType = Array<{
    title: string,
    value: number
}>

export type SelfRatingType = {
    goals: {
        quality: number,
        quantity: number,
    },
    values: {
        quality: number,
        quantity: number,
        average: number
    },
    bonuses: {
        quality: number,
        quantity: string,
        experience: number,
    }
}