import prisma from "../../config/prisma.js";

import {
    buildModel,
    recommendForUser,
    recommendCompanions
} from "../../../ml/recommendation.model.js";

const K = 5;


// =====================================================
// Food Map
// =====================================================

async function getFoodMap() {

    const foods =
        await prisma.food.findMany({

            where: {
                isActive: true
            },

            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                restaurantId: true,
                categoryId: true,

                category: {
                    select: {
                        name: true
                    }
                }
            }
        });


    return new Map(
        foods.map(food => [
            food.id,
            {
                id: food.id,
                name: food.name,
                description: food.description,
                price: food.price,
                imageUrl: food.imageUrl,
                restaurantId: food.restaurantId,
                categoryId: food.categoryId,
                categoryName: food.category.name
            }
        ])
    );
}


// =====================================================
// Food Statistics
// =====================================================

async function addFoodStats(foodList) {

    if (foodList.length === 0) {
        return [];
    }


    const foodIds =
        foodList.map(
            food => food.id
        );


    const orderItems =
        await prisma.orderItem.findMany({

            where: {
                foodId: {
                    in: foodIds
                },

                order: {
                    status: "DELIVERED"
                }
            },

            select: {
                foodId: true,

                review: {
                    select: {
                        rating: true
                    }
                }
            }
        });


    const stats = {};


    for (const item of orderItems) {

        if (!stats[item.foodId]) {

            stats[item.foodId] = {
                ratings: []
            };

        }


        if (
            item.review?.rating !== undefined
        ) {

            stats[item.foodId].ratings.push(
                item.review.rating
            );

        }

    }


    return foodList.map(food => {

        const ratings =
            stats[food.id]?.ratings || [];


        const averageRating =
            ratings.length > 0
                ? ratings.reduce(
                    (sum, rating) =>
                        sum + rating,
                    0
                ) / ratings.length
                : 0;


        return {
            ...food,

            avgRating:
                Number(
                    averageRating.toFixed(1)
                ),

            reviewCount:
                ratings.length
        };

    });
}


// =====================================================
// Recommendations
// =====================================================

export async function getRecommendations(userId) {

    // =================================================
    // 1. Cart فعلی کاربر
    // =================================================

    const cart =
        await prisma.cart.findUnique({

            where: {
                userId
            },

            include: {

                cartItems: {
                    include: {
                        food: true
                    }
                },

                restaurant: true
            }
        });


    // -------------------------------------------------
    // اگر Cart وجود نداشته باشد
    // -------------------------------------------------

    if (!cart) {

        return {
            recommendedForYou: [],
            othersAlsoBought: []
        };

    }


    // -------------------------------------------------
    // اگر Cart خالی باشد
    // -------------------------------------------------

    if (
        cart.cartItems.length === 0 ||
        !cart.restaurantId
    ) {

        return {
            recommendedForYou: [],
            othersAlsoBought: []
        };

    }


    const restaurantId =
        cart.restaurantId;


    console.log(
        "Recommendation userId:",
        userId
    );


    console.log(
        "Recommendation restaurantId:",
        restaurantId
    );


    console.log(
        "Cart items:",
        cart.cartItems.map(
            item => ({
                foodId: item.foodId,
                foodName: item.food?.name,
                foodRestaurantId:
                    item.food?.restaurantId
            })
        )
    );


    // =================================================
    // 2. سفارش‌های تحویل‌شده
    //
    // این داده‌ها برای آموزش Model هستند.
    // =================================================

    const orders =
        await prisma.order.findMany({

            where: {
                status: "DELIVERED"
            },

            select: {

                id: true,

                userId: true,

                restaurantId: true,

                createdAt: true,

                orderItems: {

                    select: {

                        foodId: true,

                        food: {
                            select: {
                                restaurantId: true
                            }
                        }

                    }

                }

            },

            orderBy: {
                createdAt: "asc"
            }

        });


    if (orders.length === 0) {

        return {
            recommendedForYou: [],
            othersAlsoBought: []
        };

    }


    // =================================================
    // 3. ساخت Model
    // =================================================

    const model =
        buildModel(orders);


    const foodMap =
        await getFoodMap();


    // =================================================
    // 4. سفارش‌های قبلی همین کاربر
    //    فقط در همان Restaurant فعلی Cart
    // =================================================

    const userOrders =
        orders.filter(order =>
            order.userId === userId &&
            order.restaurantId === restaurantId
        );


    console.log(
        "User orders in current restaurant:",
        userOrders.length
    );


    // =================================================
    // 5. Recommended For You
    // =================================================
    //
    // بر اساس سابقه خود کاربر
    // در همین Restaurant.
    // =================================================

    const recommendations =
        recommendForUser(
            userId,
            restaurantId,
            model,
            K
        );


    const recommendedForYou = [];


    for (
        const recommendation
        of recommendations
    ) {

        const food =
            foodMap.get(
                recommendation.foodId
            );


        if (!food) {
            continue;
        }


        // -------------------------------------------------
        // Safety Check
        //
        // پیشنهاد باید متعلق به Restaurant فعلی Cart باشد.
        // -------------------------------------------------

        if (
            food.restaurantId !==
            restaurantId
        ) {
            continue;
        }


        recommendedForYou.push({

            ...food,

            score:
                recommendation.score,

            recommendationType:
                "personal"

        });


        if (
            recommendedForYou.length >= K
        ) {
            break;
        }

    }


    console.log(
        "Personal recommendations:",
        recommendedForYou.map(
            food => ({
                name: food.name,
                restaurantId:
                    food.restaurantId
            })
        )
    );


    const finalRecommendedForYou =
        await addFoodStats(
            recommendedForYou
        );


    // =================================================
    // 6. Trigger Foods
    // =================================================
    //
    // بسیار مهم:
    //
    // Trigger فقط از غذاهای داخل Cart فعلی می‌آید.
    //
    // نه از تمام خریدهای قبلی کاربر.
    // =================================================

    const triggerFoodIds = [];


    for (
        const cartItem
        of cart.cartItems
    ) {

        if (!cartItem.food) {
            continue;
        }


        // -------------------------------------------------
        // Safety Check
        //
        // Food باید متعلق به Restaurant فعلی Cart باشد.
        // -------------------------------------------------

        if (
            cartItem.food.restaurantId !==
            restaurantId
        ) {
            continue;
        }


        if (
            !triggerFoodIds.includes(
                cartItem.foodId
            )
        ) {

            triggerFoodIds.push(
                cartItem.foodId
            );

        }

    }


    console.log(
        "Trigger food IDs:",
        triggerFoodIds
    );


    // =================================================
    // 7. Others Also Bought
    // =================================================
    //
    // Model از غذاهای Cart فعلی یاد می‌گیرد
    // چه غذاهایی در همان Restaurant
    // معمولاً همراه آنها خریداری شده‌اند.
    // =================================================

    const companions =
        recommendCompanions(
            restaurantId,
            triggerFoodIds,
            model,
            K
        );


    const othersAlsoBought = [];


    for (
        const recommendation
        of companions
    ) {

        const food =
            foodMap.get(
                recommendation.foodId
            );


        if (!food) {
            continue;
        }


        // -------------------------------------------------
        // Food باید متعلق به Restaurant فعلی باشد.
        // -------------------------------------------------

        if (
            food.restaurantId !==
            restaurantId
        ) {
            continue;
        }


        // -------------------------------------------------
        // غذایی که همین الان در Cart است
        // دوباره پیشنهاد نشود.
        // -------------------------------------------------

        if (
            triggerFoodIds.includes(
                food.id
            )
        ) {
            continue;
        }


        othersAlsoBought.push({

            ...food,

            score:
                recommendation.score,

            recommendationType:
                "companion"

        });


        if (
            othersAlsoBought.length >= K
        ) {
            break;
        }

    }


    console.log(
        "Companion recommendations:",
        othersAlsoBought.map(
            food => ({
                name: food.name,
                restaurantId:
                    food.restaurantId
            })
        )
    );


    const finalOthersAlsoBought =
        await addFoodStats(
            othersAlsoBought
        );


    // =================================================
    // 8. نتیجه نهایی
    // =================================================

    return {

        restaurant: {
            id: cart.restaurant.id,
            name: cart.restaurant.name
        },

        recommendedForYou:
            finalRecommendedForYou,

        othersAlsoBought:
            finalOthersAlsoBought

    };

}