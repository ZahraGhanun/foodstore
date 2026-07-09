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

export async function getRestaurantFoods(managerId) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    return prisma.food.findMany({

        where: {

            restaurantId: restaurant.id

        },

        orderBy: {

            createdAt: "desc"

        }

    });

}
export async function createMyRestaurantFood(userId, data) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    return await prisma.food.create({

        data: {

            name: data.name,

            description: data.description,

            price: Number(data.price),

            imageUrl: data.imageUrl || null,

            isActive: data.isActive,

            restaurantId: restaurant.id,

            categoryId: data.categoryId

        },

        include: {

            category: true

        }

    });

}

export async function updateMyRestaurantFood(userId, foodId, data) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const food = await prisma.food.findFirst({

        where: {

            id: foodId,

            restaurantId: restaurant.id

        }

    });

    if (!food) {

        throw new Error("Food not found.");

    }

    return await prisma.food.update({

        where: {

            id: foodId

        },

        data: {

            name: data.name,

            description: data.description,

            price: Number(data.price),

            imageUrl: data.imageUrl || null,

            categoryId: data.categoryId,

            isActive: data.isActive

        },

        include: {

            category: true

        }

    });

}

export async function deleteMyRestaurantFood(userId, foodId) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const food = await prisma.food.findFirst({

        where: {

            id: foodId,

            restaurantId: restaurant.id

        }

    });

    if (!food) {

        throw new Error("Food not found.");

    }

    await prisma.food.delete({

        where: {

            id: foodId

        }

    });

}