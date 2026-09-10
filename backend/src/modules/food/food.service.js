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

        include: {

            category: true

        },

        orderBy: [

            {
                categoryId: "asc"
            },

            {
                displayOrder: "asc"
            },

            {
                createdAt: "asc"
            }

        ]

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

export async function moveMyRestaurantFood(
    userId,
    foodId,
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

    const food = await prisma.food.findFirst({

        where: {
            id: foodId,
            restaurantId: restaurant.id
        }

    });

    if (!food) {

        throw new Error("Food not found.");

    }

    if (
        direction !== "up" &&
        direction !== "down"
    ) {

        throw new Error("Invalid direction.");

    }

    const foods = await prisma.food.findMany({

        where: {
            restaurantId: restaurant.id,
            categoryId: food.categoryId
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

    const currentIndex = foods.findIndex(

        item => item.id === foodId

    );

    if (currentIndex === -1) {

        throw new Error("Food not found.");

    }

    const targetIndex =
        direction === "up"
            ? currentIndex - 1
            : currentIndex + 1;

    // Already at the top or bottom
    if (
        targetIndex < 0 ||
        targetIndex >= foods.length
    ) {

        return food;

    }

    // Swap foods in memory
    const reorderedFoods = [...foods];

    [
        reorderedFoods[currentIndex],
        reorderedFoods[targetIndex]
    ] = [
            reorderedFoods[targetIndex],
            reorderedFoods[currentIndex]
        ];

    // Save the complete order
    await prisma.$transaction(

        reorderedFoods.map((item, index) =>

            prisma.food.update({

                where: {
                    id: item.id
                },

                data: {
                    displayOrder: index
                }

            })

        )

    );

    return prisma.food.findUnique({

        where: {
            id: foodId
        },

        include: {
            category: true
        }

    });

}


export async function getPopularFoods() {
    const foods = await prisma.food.findMany({
        where: {
            isActive: true,
            category: {
                name: {
                    notIn: [
                        "Drinks",
                        "Salads",
                        "Appetizers",
                        "Fries",
                        "Sides",
                        "Desserts",
                        "Salads & Appetizers"
                    ]
                }
            }
        },
        include: {
            category: true,
            orderItems: {
                where: {
                    order: {
                        status: "DELIVERED"
                    }
                },
                include: {
                    review: true
                }
            }
        }
    });

    const popularFoods = foods.map(food => {
        const ratings = food.orderItems
            .map(item => item.review?.rating)
            .filter(rating => rating !== undefined);

        const averageRating =
            ratings.length > 0
                ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                : 0;

        const reviewCount = ratings.length;

        return {
            id: food.id,
            name: food.name,
            description: food.description,
            price: food.price,
            imageUrl: food.imageUrl,
            restaurantId: food.restaurantId,
            categoryId: food.categoryId,
            categoryName: food.category.name,

            orderCount: food.orderItems.length,

            reviewCount,

            averageRating: Number(averageRating.toFixed(1))
        };
    });

    const maxOrderCount = Math.max(
        ...popularFoods.map(food => food.orderCount),
        1
    );

    const scoredFoods = popularFoods.map(food => {
        const orderScore =
            food.orderCount / maxOrderCount;

        const ratingScore =
            food.averageRating / 5;

        const popularityScore =
            (orderScore * 0.7) +
            (ratingScore * 0.3);

        return {
            ...food,
            popularityScore: Number(
                popularityScore.toFixed(3)
            )
        };
    });

    scoredFoods.sort(
        (a, b) => b.popularityScore - a.popularityScore
    );

    return scoredFoods.slice(0, 10);
}
export async function getRecommendations(userId) {

    // --------------------------------
    // 1. غذاهای خریداری‌شده توسط کاربر
    // --------------------------------

    const userOrderItems =
        await prisma.orderItem.findMany({

            where: {

                order: {

                    userId,

                    status: "DELIVERED"

                }

            },

            select: {

                foodId: true

            }

        });


    if (userOrderItems.length === 0) {

        return {

            recommendedForYou: [],

            othersAlsoBought: []

        };

    }


    // تعداد دفعات خرید هر غذا توسط کاربر
    const userPurchaseCounts = {};


    for (const item of userOrderItems) {

        if (!userPurchaseCounts[item.foodId]) {

            userPurchaseCounts[item.foodId] = 0;

        }

        userPurchaseCounts[item.foodId]++;

    }


    // غذاهای خریداری‌شده
    const purchasedFoodIds =
        Object.keys(userPurchaseCounts);


    // --------------------------------
    // 2. Recommended For You
    // --------------------------------

    const purchasedFoods =
        await prisma.food.findMany({

            where: {

                id: {

                    in: purchasedFoodIds

                },

                isActive: true

            },

            include: {

                category: true,

                orderItems: {

                    where: {

                        order: {

                            status: "DELIVERED"

                        }

                    },

                    include: {

                        review: true

                    }

                }

            }

        });


    // غذاهایی که خود کاربر بیشتر خریده
    const recommendedForYou =
        purchasedFoods
            .map(food => {

                const ratings =
                    food.orderItems
                        .map(
                            item =>
                                item.review?.rating
                        )
                        .filter(
                            rating =>
                                rating !== undefined
                        );


                const averageRating =
                    ratings.length > 0
                        ? ratings.reduce(
                            (sum, rating) =>
                                sum + rating,
                            0
                        ) / ratings.length
                        : 0;


                return {

                    id: food.id,

                    name: food.name,

                    description: food.description,

                    price: food.price,

                    imageUrl: food.imageUrl,

                    restaurantId:
                        food.restaurantId,

                    categoryId:
                        food.categoryId,

                    categoryName:
                        food.category.name,

                    orderCount:
                        userPurchaseCounts[food.id],

                    avgRating:
                        Number(
                            averageRating.toFixed(1)
                        ),

                    reviewCount:
                        ratings.length

                };

            })
            .sort(
                (a, b) =>
                    b.orderCount -
                    a.orderCount
            )
            .slice(0, 5);


    // --------------------------------
    // 3. Others Also Bought
    // --------------------------------

    const relatedOrders =
        await prisma.order.findMany({

            where: {

                status: "DELIVERED",

                userId: {

                    not: userId

                },

                orderItems: {

                    some: {

                        foodId: {

                            in: purchasedFoodIds

                        }

                    }

                }

            },

            select: {

                orderItems: {

                    select: {

                        foodId: true

                    }

                }

            }

        });


    // تعداد دفعاتی که هر غذا
    // توسط خریداران مشابه خریداری شده
    const otherPurchaseCounts = {};


    for (const order of relatedOrders) {

        // هر غذا در هر سفارش فقط یک بار
        // به عنوان خرید مشترک حساب شود
        const foodIdsInOrder = [
            ...new Set(
                order.orderItems.map(
                    item => item.foodId
                )
            )
        ];


        for (const foodId of foodIdsInOrder) {

            if (!otherPurchaseCounts[foodId]) {

                otherPurchaseCounts[foodId] = 0;

            }

            otherPurchaseCounts[foodId]++;

        }

    }


    const otherFoodIds =
        Object.keys(otherPurchaseCounts);


    if (otherFoodIds.length === 0) {

        return {

            recommendedForYou,

            othersAlsoBought: []

        };

    }


    // --------------------------------
    // 4. اطلاعات غذاهای Others Also Bought
    // --------------------------------

    const otherFoods =
        await prisma.food.findMany({

            where: {

                id: {

                    in: otherFoodIds

                },

                isActive: true

            },

            include: {

                category: true,

                orderItems: {

                    where: {

                        order: {

                            status: "DELIVERED"

                        }

                    },

                    include: {

                        review: true

                    }

                }

            }

        });


    const othersAlsoBought =
        otherFoods
            .map(food => {

                const ratings =
                    food.orderItems
                        .map(
                            item =>
                                item.review?.rating
                        )
                        .filter(
                            rating =>
                                rating !== undefined
                        );


                const averageRating =
                    ratings.length > 0
                        ? ratings.reduce(
                            (sum, rating) =>
                                sum + rating,
                            0
                        ) / ratings.length
                        : 0;


                return {

                    id: food.id,

                    name: food.name,

                    description: food.description,

                    price: food.price,

                    imageUrl: food.imageUrl,

                    restaurantId:
                        food.restaurantId,

                    categoryId:
                        food.categoryId,

                    categoryName:
                        food.category.name,

                    orderCount:
                        otherPurchaseCounts[
                        food.id
                        ],

                    avgRating:
                        Number(
                            averageRating.toFixed(1)
                        ),

                    reviewCount:
                        ratings.length

                };

            })
            .sort(
                (a, b) =>
                    b.orderCount -
                    a.orderCount
            )
            .slice(0, 5);


    // --------------------------------
    // 5. نتیجه نهایی
    // --------------------------------

    return {

        recommendedForYou,

        othersAlsoBought

    };

}