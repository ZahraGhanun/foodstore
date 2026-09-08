import prisma from "../../config/prisma.js";

export async function createReview(userId, orderItemId, data) {

    const { rating, comment, complaint } = data;

    // بررسی امتیاز
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be an integer between 1 and 5.");
    }

    // پیدا کردن OrderItem
    const orderItem = await prisma.orderItem.findUnique({

        where: {
            id: orderItemId
        },

        include: {
            order: true,
            food: true,
            review: true
        }

    });

    if (!orderItem) {
        throw new Error("Order item not found.");
    }

    // بررسی اینکه سفارش متعلق به همین کاربر باشد
    if (orderItem.order.userId !== userId) {
        throw new Error("Access denied.");
    }

    // فقط سفارش تحویل داده شده قابل بررسی است
    if (orderItem.order.status !== "DELIVERED") {
        throw new Error("You can only review delivered orders.");
    }

    // هر OrderItem فقط یک Review
    if (orderItem.review) {
        throw new Error("This item has already been reviewed.");
    }

    // ساخت Review
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

    // به‌روزرسانی امتیاز رستوران
    const restaurant = await prisma.restaurant.findUnique({

        where: {
            id: orderItem.order.restaurantId
        },

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