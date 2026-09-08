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

            categories: {
                orderBy: {
                    displayOrder: "asc"
                }
            },

            foods: {
                where: {
                    isActive: true
                },

                orderBy: {
                    displayOrder: "asc"
                },

                include: {
                    orderItems: {
                        include: {
                            review: {
                                select: {
                                    rating: true,
                                    comment: true,
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            }

        }

    });

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    restaurant.foods = restaurant.foods.map(food => {

        const reviews = food.orderItems
            .map(orderItem => orderItem.review)
            .filter(review => review !== null);

        const orderCount = food.orderItems.length;

        const reviewCount = reviews.length;

        const avgRating =
            reviewCount > 0
                ? Number(
                    (
                        reviews.reduce(
                            (sum, review) => sum + review.rating,
                            0
                        ) / reviewCount
                    ).toFixed(1)
                )
                : 0;

        return {
            ...food,
            orderCount,
            reviewCount,
            avgRating
        };

    });

    return restaurant;
}

export async function getAdminRestaurants() {

    return prisma.restaurant.findMany({

        orderBy: {

            createdAt: "desc"

        }

    });

}

export async function deactivateRestaurant(id) {

    const restaurant = await prisma.restaurant.findUnique({
        where: { id }
    });

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    return prisma.restaurant.update({
        where: { id },
        data: {
            isActive: false
        }
    });
}