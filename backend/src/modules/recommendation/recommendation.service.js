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

// اطلاعات کامل غذاها برای ارسال به Frontend
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

// اضافه کردن میانگین امتیاز و تعداد Review به غذاها
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

    // -------------------------------------------------
    // 1. سفارش‌های تحویل‌شده
    // -------------------------------------------------

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
                        foodId: true
                    }
                }
            },

            orderBy: {
                createdAt: "asc"
            }
        });


    // -------------------------------------------------
    // 2. اگر هیچ سفارش تحویل‌شده‌ای وجود نداشت
    // -------------------------------------------------

    if (orders.length === 0) {

        return {
            recommendedForYou: [],
            othersAlsoBought: []
        };

    }


    // -------------------------------------------------
    // 3. ساخت Model
    // -------------------------------------------------

    const model =
        buildModel(orders);


    const foodMap =
        await getFoodMap();


    // -------------------------------------------------
    // 4. سفارش‌های تحویل‌شده کاربر
    // -------------------------------------------------

    const userOrders =
        orders.filter(
            order =>
                order.userId === userId
        );


    console.log(
        "Recommendation userId:",
        userId
    );


    console.log(
        "User delivered orders:",
        userOrders.length
    );


    // -------------------------------------------------
    // اگر کاربر هیچ سفارش تحویل‌شده‌ای ندارد
    // -------------------------------------------------

    if (userOrders.length === 0) {

        return {
            recommendedForYou: [],
            othersAlsoBought: []
        };

    }


    // -------------------------------------------------
    // 5. رستوران‌هایی که کاربر از آن‌ها خرید کرده
    // -------------------------------------------------

    const restaurantIds = [
        ...new Set(
            userOrders.map(
                order =>
                    order.restaurantId
            )
        )
    ];


    // =================================================
    // 6. Recommended For You
    // =================================================
    //
    // برای هر رستوران، recommendation جداگانه
    // ساخته می‌شود.
    //
    // نکته مهم:
    // غذای پیشنهادی باید حتماً متعلق به همان
    // رستورانی باشد که recommendation برای آن
    // ساخته شده است.
    // =================================================

    const recommendedMap =
        new Map();


    for (
        const restaurantId
        of restaurantIds
    ) {

        const recommendations =
            recommendForUser(
                userId,
                restaurantId,
                model,
                K
            );


        // Model فعلاً فقط Food ID برمی‌گرداند
        for (
            const foodId
            of recommendations
        ) {

            const food =
                foodMap.get(foodId);


            // اگر غذا در Food Map نبود
            if (!food) {
                continue;
            }


            // -------------------------------------------------
            // بررسی مهم:
            // غذا باید متعلق به همان رستورانی باشد
            // که recommendation برای آن ساخته شده.
            // -------------------------------------------------

            if (
                food.restaurantId !== restaurantId
            ) {
                continue;
            }


            // -------------------------------------------------
            // جلوگیری از تکرار غذا
            // -------------------------------------------------

            if (
                recommendedMap.has(food.id)
            ) {
                continue;
            }


            recommendedMap.set(
                food.id,
                {
                    ...food,

                    /*
                     * Model فعلاً فقط Food ID
                     * برمی‌گرداند.
                     *
                     * بنابراین Score واقعی در
                     * این لایه در دسترس نیست.
                     */

                    score: 1,

                    /*
                     * از restaurantId واقعی خود Food
                     * استفاده می‌کنیم.
                     */

                    restaurantId:
                        food.restaurantId,

                    recommendationType:
                        "personal"
                }
            );

        }

    }


    // -------------------------------------------------
    // مرتب‌سازی و محدود کردن پیشنهادهای شخصی
    // -------------------------------------------------

    let recommendedForYou = [
        ...recommendedMap.values()
    ]
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(0, K);


    console.log(
        "Personal recommendation candidates:",
        recommendedMap.size
    );


    console.log(
        "Personal recommendations:",
        recommendedForYou.length
    );


    // اضافه کردن Rating و Review Count
    recommendedForYou =
        await addFoodStats(
            recommendedForYou
        );


    // =================================================
    // 7. Others Also Bought
    // =================================================
    //
    // غذاهای خریداری‌شده توسط کاربر Trigger هستند.
    //
    // برای هر Trigger:
    //   restaurantId + foodId
    //
    // Model غذاهایی را پیشنهاد می‌دهد که در همان
    // رستوران معمولاً همراه Trigger خریداری شده‌اند.
    // =================================================

    const triggerFoods = [];


    for (const order of userOrders) {

        for (
            const item
            of order.orderItems
        ) {

            if (
                !triggerFoods.includes(
                    item.foodId
                )
            ) {

                triggerFoods.push(
                    item.foodId
                );

            }

        }

    }


    // -------------------------------------------------
    // جمع‌آوری Companionها
    // -------------------------------------------------

    const companionMap =
        new Map();


    for (
        const foodId
        of triggerFoods
    ) {

        const food =
            foodMap.get(foodId);


        if (!food) {
            continue;
        }


        const companions =
            recommendCompanions(
                food.restaurantId,
                [foodId],
                model,
                K
            );


        // Model فعلاً فقط Food ID برمی‌گرداند
        for (
            const companionFoodId
            of companions
        ) {

            const companionFood =
                foodMap.get(
                    companionFoodId
                );


            if (!companionFood) {
                continue;
            }


            // -------------------------------------------------
            // غذای Trigger خودش پیشنهاد نشود
            // -------------------------------------------------

            if (
                triggerFoods.includes(
                    companionFood.id
                )
            ) {
                continue;
            }


            // -------------------------------------------------
            // بررسی مهم:
            // Companion باید متعلق به همان رستورانی
            // باشد که Trigger از آن آمده است.
            // -------------------------------------------------

            if (
                companionFood.restaurantId !==
                food.restaurantId
            ) {
                continue;
            }


            // -------------------------------------------------
            // جلوگیری از تکرار
            // -------------------------------------------------

            if (
                companionMap.has(
                    companionFood.id
                )
            ) {
                continue;
            }


            companionMap.set(
                companionFood.id,
                {
                    ...companionFood,

                    score: 1,

                    recommendationType:
                        "companion"
                }
            );

        }

    }


    // -------------------------------------------------
    // مرتب‌سازی Companionها
    // -------------------------------------------------

    let othersAlsoBought = [
        ...companionMap.values()
    ]
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(0, K);


    // اضافه کردن Rating و Review Count
    othersAlsoBought =
        await addFoodStats(
            othersAlsoBought
        );


    // =================================================
    // 8. نتیجه نهایی
    // =================================================

    return {
        recommendedForYou,
        othersAlsoBought
    };

}