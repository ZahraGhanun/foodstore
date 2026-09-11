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


// =====================================================
// Restaurant Recommendations
// =====================================================
//
// پیشنهاد ۱۰ غذای یک Restaurant مشخص.
//
// اولویت:
// 1. Personal Recommendation
// 2. Co-Purchase
// 3. Restaurant Popularity
//
// این تابع به Cart وابسته نیست.
// =====================================================

export async function getRestaurantRecommendations(
    userId,
    restaurantId,
    limit = 10
) {

    // =================================================
    // 1. سفارش‌های تحویل‌شده
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
        return [];
    }


    // =================================================
    // 2. ساخت Model
    // =================================================

    const model =
        buildModel(orders);


    const foodMap =
        await getFoodMap();


    // =================================================
    // 3. غذاهای نامناسب برای Recommendation
    // =================================================

    const excludedCategoryWords = [
        "drink",
        "beverage",
        "نوشیدنی",
        "salad",
        "سالاد"
    ];


    function isMainFood(food) {

        const categoryName =
            food.categoryName
                ?.toLowerCase()
                .trim() || "";


        return !excludedCategoryWords.some(
            word =>
                categoryName.includes(
                    word.toLowerCase()
                )
        );

    }


    // =================================================
    // 4. Personal Recommendations
    // =================================================

    const personalRecommendations =
        recommendForUser(
            userId,
            restaurantId,
            model,
            limit
        );


    const recommendations = [];

    const addedFoodIds = new Set();


    for (
        const recommendation
        of personalRecommendations
    ) {

        const food =
            foodMap.get(
                recommendation.foodId
            );


        if (!food) {
            continue;
        }


        // فقط همین Restaurant
        if (
            food.restaurantId !==
            restaurantId
        ) {
            continue;
        }


        // حذف نوشیدنی و سالاد
        if (!isMainFood(food)) {
            continue;
        }


        if (
            addedFoodIds.has(food.id)
        ) {
            continue;
        }


        recommendations.push({

            ...food,

            score:
                recommendation.score,

            recommendationType:
                "personal"

        });


        addedFoodIds.add(
            food.id
        );


        if (
            recommendations.length >=
            limit
        ) {
            break;
        }

    }


    // =================================================
    // 5. Co-Purchase
    // =================================================
    //
    // برای کاربر، غذاهایی که قبلاً در همین
    // Restaurant خریده شده‌اند به عنوان Trigger
    // استفاده می‌شوند.
    // =================================================

    const userRestaurantFoods =
        model
            .userRestaurantFoodCounts[
        userId
        ]?.[
        restaurantId
        ] || {};


    const triggerFoodIds =
        Object.keys(
            userRestaurantFoods
        );


    if (
        recommendations.length < limit &&
        triggerFoodIds.length > 0
    ) {

        const remaining =
            limit -
            recommendations.length;


        const companions =
            recommendCompanions(
                restaurantId,
                triggerFoodIds,
                model,
                remaining
            );


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


            if (
                food.restaurantId !==
                restaurantId
            ) {
                continue;
            }


            if (!isMainFood(food)) {
                continue;
            }


            if (
                addedFoodIds.has(
                    food.id
                )
            ) {
                continue;
            }


            recommendations.push({

                ...food,

                score:
                    recommendation.score,

                recommendationType:
                    "companion"

            });


            addedFoodIds.add(
                food.id
            );


            if (
                recommendations.length >=
                limit
            ) {
                break;
            }

        }

    }


    // =================================================
    // 6. Popularity Fallback
    // =================================================
    //
    // اگر Personal + Co-Purchase کمتر از 10
    // نتیجه دادند، محبوب‌ترین غذاهای Restaurant
    // را اضافه می‌کنیم.
    // =================================================

    if (
        recommendations.length <
        limit
    ) {

        const restaurantPopularity =
            model
                .restaurantFoodOrderCounts[
            restaurantId
            ] || {};


        const popularFoods =
            Object.entries(
                restaurantPopularity
            )
                .sort(
                    ([, countA], [, countB]) =>
                        countB - countA
                );


        for (
            const [
                foodId,
                popularity
            ]
            of popularFoods
        ) {

            if (
                recommendations.length >=
                limit
            ) {
                break;
            }


            if (
                addedFoodIds.has(foodId)
            ) {
                continue;
            }


            const food =
                foodMap.get(
                    foodId
                );


            if (!food) {
                continue;
            }


            if (
                food.restaurantId !==
                restaurantId
            ) {
                continue;
            }


            if (!isMainFood(food)) {
                continue;
            }


            recommendations.push({

                ...food,

                score:
                    popularity,

                recommendationType:
                    "popular"

            });


            addedFoodIds.add(
                food.id
            );

        }

    }


    // =================================================
    // 7. Food Statistics
    // =================================================

    const finalRecommendations =
        await addFoodStats(
            recommendations
        );


    console.log(
        "Restaurant recommendations:",
        {
            userId,
            restaurantId,
            count:
                finalRecommendations.length,
            recommendations:
                finalRecommendations.map(
                    food => ({
                        name: food.name,
                        type:
                            food.recommendationType
                    })
                )
        }
    );


    // =================================================
    // 8. Result
    // =================================================

    return finalRecommendations;

}