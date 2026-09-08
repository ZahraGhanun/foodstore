import prisma from "../../config/prisma.js";

export async function createReview(userId, orderItemId, data) {

    const { rating, comment, complaint } = data;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be an integer between 1 and 5.");
    }

    const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
            order: true,
            food: true,
            review: true
        }
    });

    if (!orderItem) {
        throw new Error("Order item not found.");
    }

    if (orderItem.order.userId !== userId) {
        throw new Error("Access denied.");
    }

    if (orderItem.order.status !== "DELIVERED") {
        throw new Error("You can only review delivered orders.");
    }

    if (orderItem.review) {
        throw new Error("This item has already been reviewed.");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            restaurantId: orderItem.order.restaurantId,
            orderItemId,
            rating,
            comment: comment?.trim() || null,
            complaint: complaint?.trim() || null
        },
        include: {
            orderItem: {
                include: {
                    food: true
                }
            }
        }
    });

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: orderItem.order.restaurantId },
        select: {
            avgRating: true,
            totalReviews: true
        }
    });

    if (restaurant) {
        const oldTotal = restaurant.totalReviews;
        const newTotal = oldTotal + 1;

        const newAverage =
            (
                Number(restaurant.avgRating) * oldTotal +
                rating
            ) / newTotal;

        await prisma.restaurant.update({
            where: {
                id: orderItem.order.restaurantId
            },
            data: {
                avgRating: Number(newAverage.toFixed(1)),
                totalReviews: newTotal
            }
        });
    }

    return review;
}


export async function getFoodReviews(foodId) {

    const food = await prisma.food.findUnique({
        where: {
            id: foodId
        }
    });

    if (!food) {
        throw new Error("Food not found.");
    }

    const reviews = await prisma.review.findMany({
        where: {
            orderItem: {
                foodId: foodId
            }
        },

        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
        },

        orderBy: {
            createdAt: "desc"
        }
    });

    return {
        food: {
            id: food.id,
            name: food.name,
            imageUrl: food.imageUrl,
            price: food.price
        },

        reviews
    };
}


export async function getMyReviews(userId) {

    return prisma.review.findMany({
        where: {
            userId
        },

        include: {
            orderItem: {
                include: {
                    food: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true
                        }
                    },

                    order: {
                        select: {
                            id: true,
                            createdAt: true,
                            status: true
                        }
                    }
                }
            },

            restaurant: {
                select: {
                    id: true,
                    name: true
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });
}