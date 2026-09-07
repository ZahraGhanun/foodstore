import prisma from "../../config/prisma.js";

import {

    createCategorySchema

} from "./category.validation.js";

export async function createCategory(

    restaurantId,

    managerId,

    data

) {

    const validatedData =
        createCategorySchema.parse(data);

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

    return await prisma.category.create({

        data: {

            restaurantId,

            ...validatedData

        }

    });

}

export async function getCategories(

    restaurantId

) {

    return await prisma.category.findMany({

        where: {

            restaurantId,

            isActive: true

        },

        orderBy: {

            displayOrder: "asc"

        }

    });

}


export async function getMyCategories(managerId) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    return prisma.category.findMany({

        where: {

            restaurantId: restaurant.id

        },

        orderBy: {

            displayOrder: "asc"

        }

    });

}


export async function createMyRestaurantCategory(userId, data) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    return await prisma.category.create({

        data: {

            name: data.name,

            restaurantId: restaurant.id

        }

    });

}


export async function updateMyRestaurantCategory(userId, categoryId, data) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const category = await prisma.category.findFirst({

        where: {

            id: categoryId,

            restaurantId: restaurant.id

        }

    });

    if (!category) {

        throw new Error("Category not found.");

    }

    return await prisma.category.update({

        where: {

            id: categoryId

        },

        data: {

            name: data.name

        }

    });

}

export async function deleteMyRestaurantCategory(userId, categoryId) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const category = await prisma.category.findFirst({

        where: {

            id: categoryId,

            restaurantId: restaurant.id

        }

    });

    if (!category) {

        throw new Error("Category not found.");

    }

    await prisma.category.delete({

        where: {

            id: categoryId

        }

    });

}


export async function moveMyRestaurantCategory(
    userId,
    categoryId,
    direction
) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {
            managerId: userId
        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const category = await prisma.category.findFirst({

        where: {
            id: categoryId,
            restaurantId: restaurant.id
        }

    });

    if (!category) {

        throw new Error("Category not found.");

    }

    if (
        direction !== "up" &&
        direction !== "down"
    ) {

        throw new Error("Invalid direction.");

    }

    const categories = await prisma.category.findMany({

        where: {
            restaurantId: restaurant.id
        },

        orderBy: [
            {
                displayOrder: "asc"
            },
            {
                createdAt: "asc"
            }
        ]

    });

    const currentIndex = categories.findIndex(

        item => item.id === categoryId

    );

    if (currentIndex === -1) {

        throw new Error("Category not found.");

    }

    const targetIndex =
        direction === "up"
            ? currentIndex - 1
            : currentIndex + 1;

    // Already at the top or bottom
    if (
        targetIndex < 0 ||
        targetIndex >= categories.length
    ) {

        return category;

    }

    // Swap the categories in memory
    const reorderedCategories = [...categories];

    [
        reorderedCategories[currentIndex],
        reorderedCategories[targetIndex]
    ] = [
            reorderedCategories[targetIndex],
            reorderedCategories[currentIndex]
        ];

    // Save the complete order
    await prisma.$transaction(

        reorderedCategories.map((item, index) =>

            prisma.category.update({

                where: {
                    id: item.id
                },

                data: {
                    displayOrder: index
                }

            })

        )

    );

    return prisma.category.findUnique({

        where: {
            id: categoryId
        }

    });

}