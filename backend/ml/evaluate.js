import prisma from "../src/config/prisma.js";

const K = 5;

// ========================================
// 1. گرفتن تعاملات با زمان سفارش
// ========================================

async function getDeliveredInteractions() {
    const orders = await prisma.order.findMany({
        where: {
            status: "DELIVERED"
        },
        select: {
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

    const interactions = [];

    for (const order of orders) {
        const foodIds = [
            ...new Set(
                order.orderItems.map(item => item.foodId)
            )
        ];

        for (const foodId of foodIds) {
            interactions.push({
                userId: order.userId,
                restaurantId: order.restaurantId,
                foodId,
                createdAt: order.createdAt
            });
        }
    }

    return interactions;
}


// ========================================
// 2. Time-based Train / Test Split
// ========================================

function createTrainTestSplit(interactions) {
    const grouped = {};

    for (const interaction of interactions) {
        const key =
            `${interaction.userId}_${interaction.restaurantId}`;

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(interaction);
    }

    const trainInteractions = [];
    const testInteractions = [];

    for (const key of Object.keys(grouped)) {
        const userRestaurantInteractions =
            grouped[key].sort(
                (a, b) =>
                    new Date(a.createdAt) -
                    new Date(b.createdAt)
            );

        /*
        حداقل دو تعامل لازم است:
        یکی برای Train
        یکی برای Test
        */

        if (userRestaurantInteractions.length < 2) {
            continue;
        }

        /*
        آخرین تعامل زمانی → Test
        */

        const testInteraction =
            userRestaurantInteractions[
            userRestaurantInteractions.length - 1
            ];

        testInteractions.push(testInteraction);

        /*
        تمام تعاملات قبلی → Train
        */

        for (
            let i = 0;
            i < userRestaurantInteractions.length - 1;
            i++
        ) {
            trainInteractions.push(
                userRestaurantInteractions[i]
            );
        }
    }

    return {
        trainInteractions,
        testInteractions
    };
}


// ========================================
// 3. ساخت Item-Based CF
// ========================================

const CATEGORY_WEIGHTS = {

    MAIN: 0.90,

    APPETIZER: 0.70,

    SIDE: 0.70,

    SALAD: 0.60,

    DRINK: 0.80
};


function getCategoryType(categoryName) {

    const name =
        categoryName
            .trim()
            .toLowerCase();


    if (name === "drinks") {
        return "DRINK";
    }


    if (name === "salads") {
        return "SALAD";
    }


    if (
        name === "appetizers" ||
        name === "salads & appetizers"
    ) {
        return "APPETIZER";
    }


    if (
        name === "sides" ||
        name === "fries" ||
        name === "french fries" ||
        name === "snacks"
    ) {
        return "SIDE";
    }


    return "MAIN";
}


function buildModel(trainInteractions) {

    const userRestaurantFoods = {};

    const restaurantFoodUsers = {};


    // ----------------------------------------
    // User -> Restaurant -> Foods
    // ----------------------------------------

    for (const interaction of trainInteractions) {

        const {
            userId,
            restaurantId,
            foodId
        } = interaction;


        if (!userRestaurantFoods[userId]) {

            userRestaurantFoods[userId] = {};

        }


        if (
            !userRestaurantFoods[userId][
            restaurantId
            ]
        ) {

            userRestaurantFoods[userId][
                restaurantId
            ] = new Set();

        }


        userRestaurantFoods[userId][
            restaurantId
        ].add(foodId);


        // ------------------------------------
        // Restaurant -> Food -> Users
        // ------------------------------------

        if (!restaurantFoodUsers[restaurantId]) {

            restaurantFoodUsers[restaurantId] = {};

        }


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


    // ----------------------------------------
    // Similarity Matrix
    // فقط داخل همان رستوران
    // ----------------------------------------

    const similarityMatrix = {};


    for (
        const restaurantId of Object.keys(
            restaurantFoodUsers
        )
    ) {

        similarityMatrix[
            restaurantId
        ] = {};


        const foodIds =
            Object.keys(
                restaurantFoodUsers[
                restaurantId
                ]
            );


        for (const foodA of foodIds) {

            similarityMatrix[
                restaurantId
            ][foodA] = {};


            for (const foodB of foodIds) {

                if (foodA === foodB) {
                    continue;
                }


                const usersA =
                    restaurantFoodUsers[
                    restaurantId
                    ][foodA];


                const usersB =
                    restaurantFoodUsers[
                    restaurantId
                    ][foodB];


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
                    continue;
                }


                const similarity =
                    intersection / union;


                if (similarity > 0) {

                    similarityMatrix[
                        restaurantId
                    ][foodA][foodB] =
                        similarity;

                }

            }

        }

    }


    // ----------------------------------------
    // Popularity
    // ----------------------------------------

    const popularity = {};


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

            popularity[foodId] =
                restaurantFoodUsers[
                    restaurantId
                ][foodId].size;

        }

    }


    return {

        userRestaurantFoods,

        restaurantFoodUsers,

        similarityMatrix,

        popularity

    };

}
// ========================================
// 4. اطلاعات غذاها
// ========================================

async function getFoodMap() {

    const foods =
        await prisma.food.findMany({

            select: {

                id: true,

                name: true,

                restaurantId: true,

                category: {
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


    return foodMap;

}
// ========================================
// 5. Recommendation
// ========================================

function recommendForUser(
    userId,
    restaurantId,
    model,
    foodMap,
    limit = K
) {

    const {
        userRestaurantFoods,
        restaurantFoodUsers,
        similarityMatrix,
        popularity
    } = model;


    const purchasedFoods =
        userRestaurantFoods[userId]?.[
        restaurantId
        ] || new Set();


    const candidateFoods =
        Object.keys(
            restaurantFoodUsers[
            restaurantId
            ] || {}
        );


    // ----------------------------------------
    // اگر کاربر در این رستوران سابقه ندارد
    // محبوب‌ترین غذاها پیشنهاد می‌شوند.
    // ----------------------------------------

    if (purchasedFoods.size === 0) {

        return candidateFoods

            .sort(
                (a, b) =>
                    (
                        popularity[b] || 0
                    ) -
                    (
                        popularity[a] || 0
                    )
            )

            .slice(0, limit)

            .map(
                foodId =>
                    foodId
            );

    }


    // ----------------------------------------
    // امتیازدهی
    // ----------------------------------------

    const scoredFoods = [];


    for (const candidateFood of candidateFoods) {

        let score = 0;


        for (
            const purchasedFood
            of purchasedFoods
        ) {

            const similarity =
                similarityMatrix[
                restaurantId
                ]?.[
                purchasedFood
                ]?.[
                candidateFood
                ] || 0;


            const categoryWeight =
                foodMap[
                    candidateFood
                ]?.categoryWeight || 1;


            score +=
                similarity *
                categoryWeight;

        }


        scoredFoods.push({

            foodId:
                candidateFood,

            score,

            popularity:
                popularity[
                candidateFood
                ] || 0

        });

    }


    // ----------------------------------------
    // مرتب‌سازی
    // اول Score
    // سپس Popularity
    // ----------------------------------------

    scoredFoods.sort(
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


    return scoredFoods

        .slice(0, limit)

        .map(
            item =>
                item.foodId
        );

}
// ========================================
// 6. Precision@5 / Recall@5
// ========================================

function calculateMetrics(
    recommendations,
    actualFoodId
) {
    const hit =
        recommendations.includes(actualFoodId);

    return {
        precision: hit ? 1 / K : 0,
        recall: hit ? 1 : 0,
        hit
    };
}


// ========================================
// 7. Evaluation
// ========================================

async function evaluate() {
    console.log("\n========================================");
    console.log("FOODSTORE MODEL EVALUATION");
    console.log("TIME-BASED SPLIT");
    console.log("Precision@5 / Recall@5");
    console.log("========================================\n");

    const interactions =
        await getDeliveredInteractions();

    console.log(
        "Total interactions:",
        interactions.length
    );

    const {
        trainInteractions,
        testInteractions
    } = createTrainTestSplit(interactions);

    console.log(
        "Training interactions:",
        trainInteractions.length
    );

    console.log(
        "Test interactions:",
        testInteractions.length
    );

    console.log(
        "\nBuilding Item-Based CF model..."
    );

    const model =
        buildModel(trainInteractions);

    const foodMap =
        await getFoodMap();

    console.log(
        "Training foods:",
        new Set(
            Object.values(
                model.restaurantFoodUsers
            )
                .flatMap(
                    foods =>
                        Object.keys(foods)
                )
        ).size
    );

    let totalPrecision = 0;
    let totalRecall = 0;
    let hits = 0;

    const results = [];

    for (const test of testInteractions) {
        const recommendations =
            recommendForUser(
                test.userId,
                test.restaurantId,
                model,
                foodMap,
                K
            );

        const metrics =
            calculateMetrics(
                recommendations,
                test.foodId
            );

        totalPrecision += metrics.precision;
        totalRecall += metrics.recall;

        if (metrics.hit) {
            hits++;
        }

        results.push({
            ...test,
            recommendations,
            hit: metrics.hit
        });
    }

    const testCount =
        testInteractions.length;

    const precisionAt5 =
        testCount > 0
            ? totalPrecision / testCount
            : 0;

    const recallAt5 =
        testCount > 0
            ? totalRecall / testCount
            : 0;

    console.log("\n========================================");
    console.log("EVALUATION RESULTS");
    console.log("========================================\n");

    console.log(
        "Evaluation samples:",
        testCount
    );

    console.log(
        "Hits:",
        hits
    );

    console.log(
        "Hit Rate:",
        `${((hits / testCount) * 100).toFixed(2)}%`
    );

    console.log(
        "Precision@5:",
        precisionAt5.toFixed(4)
    );

    console.log(
        "Recall@5:",
        recallAt5.toFixed(4)
    );

    console.log("\n========================================");

    console.log("\nSAMPLE EVALUATIONS");
    console.log("========================================\n");

    for (const result of results.slice(0, 5)) {
        console.log(
            "User:",
            result.userId
        );

        console.log(
            "Actual Food:",
            foodMap[result.foodId]?.name
            || result.foodId
        );

        console.log("Recommendations:");

        for (const foodId of result.recommendations) {
            console.log(
                " -",
                foodMap[foodId]?.name
                || foodId
            );
        }

        console.log(
            "Hit:",
            result.hit ? "YES" : "NO"
        );

        console.log("----------------------------------------");
    }
}


// ========================================
// Run
// ========================================

evaluate()
    .catch(error => {
        console.error(
            "Evaluation failed:",
            error
        );
    })
    .finally(async () => {
        await prisma.$disconnect();
    });