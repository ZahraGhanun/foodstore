import prisma from "../../config/prisma.js";

export async function getDashboard(userId) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        },

        include: {

            _count: {

                select: {

                    foods: true,

                    orders: true

                }

            }

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const recentOrders = await prisma.order.findMany({

        where: {

            restaurantId: restaurant.id

        },

        orderBy: {

            createdAt: "desc"

        },

        take: 5,

        select: {

            id: true,

            status: true,

            createdAt: true,

            finalPrice: true

        }

    });

    const popularFoods = await prisma.food.findMany({

        where: {

            restaurantId: restaurant.id,

            isActive: true

        },

        take: 3,

        select: {

            id: true,

            name: true,

            imageUrl: true,

            price: true

        }

    });

    return {

        restaurant: {

            id: restaurant.id,

            name: restaurant.name,

            logoUrl: restaurant.logoUrl,

            address: restaurant.address,

            phone: restaurant.phone,

            minimumOrder: restaurant.minimumOrder,

            deliveryFee: restaurant.deliveryFee,

            avgRating: restaurant.avgRating

        },

        foodsCount: restaurant._count.foods,

        ordersCount: restaurant._count.orders,

        recentOrders,

        popularFoods

    };

}