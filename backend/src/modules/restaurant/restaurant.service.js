import prisma from "../../config/prisma.js";

export async function getRestaurants() {
    return prisma.restaurant.findMany({
        where: {
            isActive: true
        },
        include: {
            categories: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function getRestaurantById(id) {

    const restaurant = await prisma.restaurant.findUnique({

        where: { id },

        include: {

            categories: true,

            foods: {
                where: {
                    isActive: true
                }
            }

        }

    });

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    return restaurant;
}