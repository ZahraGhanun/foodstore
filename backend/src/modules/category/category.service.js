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