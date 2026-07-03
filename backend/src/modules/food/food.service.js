import prisma from "../../config/prisma.js";

import {
    createFoodSchema
} from "./food.validation.js";

export async function createFood(
    restaurantId,
    managerId,
    data
) {

    const validatedData =
        createFoodSchema.parse(data);

    const restaurant =
        await prisma.restaurant.findUnique({

            where: {
                id: restaurantId
            }

        });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    if (restaurant.managerId !== managerId) {

        throw new Error(
            "You are not the manager of this restaurant."
        );

    }

    const category =
        await prisma.category.findUnique({

            where: {
                id: validatedData.categoryId
            }

        });

    if (!category) {

        throw new Error("Category not found.");

    }

    if (category.restaurantId !== restaurantId) {

        throw new Error(
            "Category does not belong to this restaurant."
        );

    }

    return prisma.food.create({

        data: {

            ...validatedData,

            restaurantId

        }

    });

}

export async function getFoods(
    restaurantId
) {

    return prisma.food.findMany({

        where: {

            restaurantId,

            isActive: true

        },

        include: {

            category: true

        }

    });

}