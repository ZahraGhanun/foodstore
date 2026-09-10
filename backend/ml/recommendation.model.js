import prisma from "../src/config/prisma.js";


// =====================================================
// CATEGORY WEIGHTS
// =====================================================

const CATEGORY_WEIGHTS = {

    MAIN: 0.90,

    APPETIZER: 0.70,

    SIDE: 0.70,

    SALAD: 0.60,

    DRINK: 0.80
};


// =====================================================
// CATEGORY TYPE DETECTION
// =====================================================

function getCategoryType(categoryName) {

    const name =
        categoryName
            .trim()
            .toLowerCase();


    // ---------------------------------------------
    // Drinks
    // ---------------------------------------------

    if (name === "drinks") {
        return "DRINK";
    }


    // ---------------------------------------------
    // Salads
    // ---------------------------------------------

    if (name === "salads") {
        return "SALAD";
    }


    // ---------------------------------------------
    // Appetizers
    // ---------------------------------------------

    if (
        name === "appetizers" ||
        name === "salads & appetizers"
    ) {
        return "APPETIZER";
    }


    // ---------------------------------------------
    // Sides
    // ---------------------------------------------

    if (
        name === "sides" ||
        name === "fries" ||
        name === "french fries" ||
        name === "snacks"
    ) {
        return "SIDE";
    }





    // ---------------------------------------------
    // Everything else
    // is considered a main food
    // ---------------------------------------------

    return "MAIN";

}


// =====================================================
// ITEM-BASED COLLABORATIVE FILTERING
// =====================================================

export async function trainRecommendationModel() {

    // -------------------------------------------------
    // 1. دریافت سفارش‌های تحویل‌شده
    // -------------------------------------------------

    const orders =
        await prisma.order.findMany({

            where: {
                status: "DELIVERED"
            },

            select: {

                userId: true,

                restaurantId: true,

                orderItems: {
                    select: {
                        foodId: true
                    }
                }

            }

        });


    // -------------------------------------------------
    // 2. ساخت User -> Restaurant -> Foods
    // -------------------------------------------------

    const userRestaurantFoods = {};


    for (const order of orders) {

        if (!userRestaurantFoods[order.userId]) {

            userRestaurantFoods[order.userId] = {};

        }


        if (
            !userRestaurantFoods[order.userId][
            order.restaurantId
            ]
        ) {

            userRestaurantFoods[order.userId][
                order.restaurantId
            ] = new Set();

        }


        for (const item of order.orderItems) {

            userRestaurantFoods[
                order.userId
            ][
                order.restaurantId
            ].add(item.foodId);

        }

    }


    // -------------------------------------------------
    // 3. ساخت Restaurant -> Food -> Users
    //
    // مهم:
    // similarity از این به بعد فقط در همان
    // رستوران محاسبه می‌شود.
    // -------------------------------------------------

    const restaurantFoodUsers = {};


    for (
        const userId of Object.keys(
            userRestaurantFoods
        )
    ) {

        for (
            const restaurantId of Object.keys(
                userRestaurantFoods[userId]
            )
        ) {

            if (!restaurantFoodUsers[restaurantId]) {

                restaurantFoodUsers[restaurantId] = {};

            }


            const foods =
                userRestaurantFoods[userId][
                restaurantId
                ];


            for (const foodId of foods) {

                if (
                    !restaurantFoodUsers[
                    restaurantId
                    ][foodId]
                ) {

                    restaurantFoodUsers[
                        restaurantId
                    ][foodId] = new Set();

                }


                restaurantFoodUsers[
                    restaurantId
                ][foodId].add(userId);

            }

        }

    }


    // -------------------------------------------------
    // 4. اطلاعات غذاها
    // -------------------------------------------------

    const foodList = [
        ...new Set(

            Object.values(
                restaurantFoodUsers
            )
                .flatMap(
                    foods =>
                        Object.keys(foods)
                )

        )
    ];


    const foods =
        await prisma.food.findMany({

            where: {
                id: {
                    in: foodList
                }
            },

            select: {

                id: true,

                name: true,

                price: true,

                restaurantId: true,

                category: {
                    select: {
                        name: true
                    }
                },

                restaurant: {
                    select: {
                        name: true
                    }
                }

            }

        });


    const foodMap = {};


    for (const food of foods) {

        const categoryType =
            getCategoryType(
                food.category.name
            );


        foodMap[food.id] = {

            ...food,

            categoryType,

            categoryWeight:
                CATEGORY_WEIGHTS[
                categoryType
                ]

        };

    }


    // -------------------------------------------------
    // 5. Popularity
    // -------------------------------------------------

    const foodPopularity = {};


    for (
        const restaurantId of Object.keys(
            restaurantFoodUsers
        )
    ) {

        for (
            const foodId of Object.keys(
                restaurantFoodUsers[
                restaurantId
                ]
            )
        ) {

            foodPopularity[foodId] =
                restaurantFoodUsers[
                    restaurantId
                ][foodId].size;

        }

    }


    // -------------------------------------------------
    // 6. محاسبه Jaccard Similarity
    //
    // فقط بین غذاهای یک رستوران
    // -------------------------------------------------

    function calculateSimilarity(
        restaurantId,
        foodA,
        foodB
    ) {

        const usersA =
            restaurantFoodUsers[
            restaurantId
            ]?.[foodA] || new Set();


        const usersB =
            restaurantFoodUsers[
            restaurantId
            ]?.[foodB] || new Set();


        let intersection = 0;


        for (const userId of usersA) {

            if (usersB.has(userId)) {

                intersection++;

            }

        }


        const union =
            new Set([
                ...usersA,
                ...usersB
            ]).size;


        if (union === 0) {
            return 0;
        }


        return intersection / union;

    }


    // -------------------------------------------------
    // 7. ساخت Similarity Matrix برای هر رستوران
    // -------------------------------------------------

    const similarityMatrix = {};


    for (
        const restaurantId of Object.keys(
            restaurantFoodUsers
        )
    ) {

        similarityMatrix[
            restaurantId
        ] = {};


        const restaurantFoodIds =
            Object.keys(
                restaurantFoodUsers[
                restaurantId
                ]
            );


        for (
            const foodA of restaurantFoodIds
        ) {

            similarityMatrix[
                restaurantId
            ][foodA] = {};


            for (
                const foodB of restaurantFoodIds
            ) {

                if (foodA === foodB) {
                    continue;
                }


                similarityMatrix[
                    restaurantId
                ][foodA][foodB] =
                    calculateSimilarity(
                        restaurantId,
                        foodA,
                        foodB
                    );

            }

        }

    }


    // -------------------------------------------------
    // 8. تابع پیشنهاد غذا
    // -------------------------------------------------

    function recommendForUser(
        userId,
        restaurantId,
        limit = 5
    ) {

        const restaurantFoods =
            userRestaurantFoods[userId]?.[
            restaurantId
            ] || new Set();


        // ---------------------------------------------
        // تمام غذاهای دارای داده در همان رستوران
        //
        // غذای قبلاً خریداری‌شده حذف نمی‌شود.
        // ---------------------------------------------

        const candidateFoods =
            Object.keys(
                restaurantFoodUsers[
                restaurantId
                ] || {}
            );

        // ---------------------------------------------
        // اگر کاربر در این رستوران سابقه‌ای ندارد
        // محبوب‌ترین غذاها پیشنهاد می‌شوند.
        // ---------------------------------------------

        if (restaurantFoods.size === 0) {

            return candidateFoods
                .sort(
                    (a, b) =>
                        (
                            foodPopularity[b] || 0
                        ) -
                        (
                            foodPopularity[a] || 0
                        )
                )
                .slice(0, limit)
                .map(foodId => ({

                    foodId,

                    score:
                        foodPopularity[
                        foodId
                        ] || 0,

                    popularity:
                        foodPopularity[
                        foodId
                        ] || 0

                }));

        }
        // ---------------------------------------------
        // امتیازدهی
        // ---------------------------------------------

        const scores = [];


        for (
            const candidateFood of candidateFoods
        ) {

            let score = 0;


            for (
                const purchasedFood
                of restaurantFoods
            ) {

                const similarity =
                    similarityMatrix[
                    restaurantId
                    ]?.[
                    purchasedFood
                    ]?.[
                    candidateFood
                    ] || 0;


                score +=
                    similarity *
                    (
                        foodMap[
                            candidateFood
                        ]?.categoryWeight || 1
                    );

            }


            // -----------------------------------------
            // Popularity به عنوان tie-break
            // -----------------------------------------

            scores.push({

                foodId:
                    candidateFood,

                score,

                popularity:
                    foodPopularity[
                    candidateFood
                    ] || 0

            });

        }


        // ---------------------------------------------
        // مرتب‌سازی
        // ---------------------------------------------

        scores.sort(
            (a, b) => {

                if (b.score !== a.score) {

                    return (
                        b.score -
                        a.score
                    );

                }


                return (
                    b.popularity -
                    a.popularity
                );

            }
        );


        // ---------------------------------------------
        // Popularity Fallback
        // ---------------------------------------------

        const selected =
            scores.slice(
                0,
                limit
            );


        if (
            selected.length <
            limit
        ) {

            const selectedIds =
                new Set(
                    selected.map(
                        item =>
                            item.foodId
                    )
                );


            const popularFoods =
                candidateFoods

                    .filter(
                        foodId =>
                            !selectedIds.has(
                                foodId
                            )
                    )

                    .sort(
                        (a, b) =>
                            (
                                foodPopularity[b] ||
                                0
                            ) -
                            (
                                foodPopularity[a] ||
                                0
                            )
                    );


            for (
                const foodId
                of popularFoods
            ) {

                if (
                    selected.length >=
                    limit
                ) {

                    break;

                }


                selected.push({

                    foodId,

                    score:
                        foodPopularity[
                        foodId
                        ] || 0,

                    popularity:
                        foodPopularity[
                        foodId
                        ] || 0

                });

            }

        }


        return selected;

    }


    // -------------------------------------------------
    // 9. تست مدل
    // -------------------------------------------------
    // =====================================================
    // TEST POPULARITY FALLBACK
    // =====================================================
    // =====================================================
    // TEST POPULARITY FALLBACK
    // =====================================================

    const sampleUser =
        "test-user-with-no-history";


    const sampleRestaurant =
        Object.keys(
            restaurantFoodUsers
        ).find(
            restaurantId => {

                const foodIds =
                    Object.keys(
                        restaurantFoodUsers[
                        restaurantId
                        ]
                    );

                return foodIds.some(
                    foodId =>
                        foodMap[foodId]?.restaurant.name ===
                        "Pizza House"
                );

            }
        );


    const recommendations =
        recommendForUser(
            sampleUser,
            sampleRestaurant,
            5
        );


    console.log(
        "\n========================================"
    );

    console.log(
        "ITEM-BASED COLLABORATIVE FILTERING"
    );

    console.log(
        "RESTAURANT-SPECIFIC + CATEGORY WEIGHT"
    );

    console.log(
        "========================================\n"
    );


    console.log(
        "Sample User:",
        sampleUser
    );


    console.log(
        "Sample Restaurant:",
        "Pizza House"
    );


    console.log(
        "\nRecommendations:"
    );


    for (
        const recommendation
        of recommendations
    ) {

        const food =
            foodMap[
            recommendation.foodId
            ];


        console.log(

            `${food.name}` +
            ` | ${food.categoryType}` +
            ` | Weight: ${food.categoryWeight}` +
            ` | Score: ${recommendation.score.toFixed(3)}`

        );

    }


    // -------------------------------------------------
    // 10. Statistics
    // -------------------------------------------------

    console.log(
        "\n========================================"
    );

    console.log(
        "MODEL STATISTICS"
    );

    console.log(
        "========================================\n"
    );


    console.log(
        "Delivered Orders:",
        orders.length
    );


    console.log(
        "Users:",
        Object.keys(
            userRestaurantFoods
        ).length
    );


    console.log(
        "Foods:",
        foodList.length
    );


    console.log(
        "Restaurants:",
        Object.keys(
            restaurantFoodUsers
        ).length
    );


    return {

        recommendForUser,

        similarityMatrix,

        foodPopularity,

        foodMap,

        userRestaurantFoods,

        restaurantFoodUsers,

        foodList

    };

}


// =====================================================
// TEST
// =====================================================

async function testModel() {

    await trainRecommendationModel();

    await prisma.$disconnect();

}


testModel()
    .catch(error => {

        console.error(
            "\n❌ Model training failed:",
            error
        );

        prisma.$disconnect();

    });