import prisma from "../src/config/prisma.js";

import {
    buildModel,
    recommendCompanions
} from "./recommendation.model.js";

const K = 5;

// ========================================
// 1. Get delivered orders
// ========================================

async function getDeliveredOrders() {

    return await prisma.order.findMany({

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
}

// ========================================
// 2. Get food information
// ========================================
//
// Used only for displaying readable
// evaluation results instead of UUIDs.
//

async function getFoodMap() {

    const foods =
        await prisma.food.findMany({

            select: {

                id: true,

                name: true,

                category: {

                    select: {
                        name: true
                    }

                }

            }

        });

    const foodMap = {};

    for (const food of foods) {

        foodMap[food.id] = {

            name:
                food.name,

            category:
                food.category?.name
                || "Unknown"

        };

    }

    return foodMap;
}

// ========================================
// 3. Clean baskets
// ========================================
//
// Remove duplicate food IDs inside
// the same order.
//
// Example:
//
// Pizza
// Pizza
// Cola
//
// becomes:
//
// Pizza
// Cola
// ========================================

function normalizeOrders(
    orders
) {

    return orders

        .map(order => {

            const foodIds = [
                ...new Set(
                    order.orderItems
                        .map(
                            item =>
                                item.foodId
                        )
                )
            ];

            return {

                id:
                    order.id,

                userId:
                    order.userId,

                restaurantId:
                    order.restaurantId,

                createdAt:
                    order.createdAt,

                orderItems:
                    foodIds.map(
                        foodId => ({
                            foodId
                        })
                    )

            };

        })

        .filter(
            order =>
                order.orderItems.length > 0
        );
}

// ========================================
// 4. Time-based basket split
// ========================================
//
// We split by ORDER/BASKET,
// not by individual food.
//
// For every:
//
// user + restaurant
//
// the last order becomes TEST.
//
// Previous orders become TRAIN.
//
// Example:
//
// User A
// Restaurant X
//
// Order 1 -> TRAIN
// Order 2 -> TRAIN
// Order 3 -> TRAIN
// Order 4 -> TEST
// ========================================

function createBasketTrainTestSplit(
    orders
) {

    const grouped = {};

    for (const order of orders) {

        const key =
            `${order.userId}_${order.restaurantId}`;

        if (!grouped[key]) {

            grouped[key] = [];

        }

        grouped[key].push(
            order
        );
    }

    const trainOrders = [];
    const testOrders = [];

    for (
        const key
        of Object.keys(grouped)
    ) {

        const userRestaurantOrders =
            grouped[key].sort(
                (a, b) =>
                    new Date(
                        a.createdAt
                    ) -
                    new Date(
                        b.createdAt
                    )
            );

        // Need at least two baskets.
        if (
            userRestaurantOrders.length < 2
        ) {

            continue;

        }

        const testOrder =
            userRestaurantOrders[
            userRestaurantOrders.length - 1
            ];

        testOrders.push(
            testOrder
        );

        for (
            let i = 0;
            i <
            userRestaurantOrders.length - 1;
            i++
        ) {

            trainOrders.push(
                userRestaurantOrders[i]
            );

        }

    }

    return {

        trainOrders,

        testOrders

    };
}

// ========================================
// 5. Calculate basket metrics
// ========================================
//
// Example:
//
// Test basket:
//
// Pizza + Doogh + Cola
//
// Trigger:
//
// Pizza
//
// Expected companions:
//
// Doogh
// Cola
//
// Recommendation:
//
// Doogh
// Cola
// Salad
// Water
// Fries
//
// Hits = 2
//
// Precision = 2 / 5
//
// Recall = 2 / 2
// ========================================

function calculateBasketMetrics(
    recommendations,
    expectedFoods
) {

    const expected =
        new Set(
            expectedFoods
        );

    const hits =
        recommendations.filter(
            foodId =>
                expected.has(
                    foodId
                )
        );

    const precision =
        recommendations.length > 0

            ? hits.length /
            recommendations.length

            : 0;

    const recall =
        expected.size > 0

            ? hits.length /
            expected.size

            : 0;

    return {

        hits:
            hits.length,

        precision,

        recall

    };
}

// ========================================
// 6. Evaluation
// ========================================

async function evaluate() {

    console.log(
        "\n========================================"
    );

    console.log(
        "FOODSTORE BASKET RECOMMENDATION EVALUATION"
    );

    console.log(
        "ITEM-BASED CF + CO-PURCHASE"
    );

    console.log(
        "TIME-BASED BASKET SPLIT"
    );

    console.log(
        "PRECISION@5 / RECALL@5"
    );

    console.log(
        "========================================\n"
    );

    // ====================================
    // Load orders
    // ====================================

    console.log(
        "Loading delivered orders..."
    );

    const rawOrders =
        await getDeliveredOrders();

    const orders =
        normalizeOrders(
            rawOrders
        );

    console.log(
        "Delivered baskets:",
        orders.length
    );

    // ====================================
    // Load food names
    // ====================================

    console.log(
        "Loading food information..."
    );

    const foodMap =
        await getFoodMap();

    console.log(
        "Foods loaded:",
        Object.keys(
            foodMap
        ).length
    );

    // ====================================
    // Train / Test split
    // ====================================

    const {
        trainOrders,
        testOrders
    } =
        createBasketTrainTestSplit(
            orders
        );

    console.log(
        "Training baskets:",
        trainOrders.length
    );

    console.log(
        "Test baskets:",
        testOrders.length
    );

    // ====================================
    // Build model
    // ====================================

    console.log(
        "\nBuilding recommendation model..."
    );

    const model =
        buildModel(
            trainOrders
        );

    console.log(
        "Model built successfully."
    );

    // ====================================
    // Evaluation variables
    // ====================================

    let totalPrecision = 0;

    let totalRecall = 0;

    let totalHits = 0;

    let evaluationSamples = 0;

    const results = [];

    // ====================================
    // Evaluate test baskets
    // ====================================

    for (
        const testOrder
        of testOrders
    ) {

        const testFoodIds =
            testOrder.orderItems.map(
                item =>
                    item.foodId
            );

        // A basket containing only one
        // food cannot evaluate companions.
        if (
            testFoodIds.length < 2
        ) {

            continue;

        }

        // =================================
        // Each food becomes a trigger.
        // =================================

        for (
            const triggerFoodId
            of testFoodIds
        ) {

            const expectedFoods =
                testFoodIds.filter(
                    foodId =>
                        foodId !==
                        triggerFoodId
                );

            // =================================
            // Get companion recommendations
            // =================================

            const recommendations =
                recommendCompanions(

                    testOrder.restaurantId,

                    [
                        triggerFoodId
                    ],

                    model,

                    K

                );

            // =================================
            // Calculate metrics
            // =================================

            const metrics =
                calculateBasketMetrics(

                    recommendations,

                    expectedFoods

                );

            totalPrecision +=
                metrics.precision;

            totalRecall +=
                metrics.recall;

            totalHits +=
                metrics.hits;

            evaluationSamples++;

            results.push({

                userId:
                    testOrder.userId,

                restaurantId:
                    testOrder.restaurantId,

                triggerFoodId,

                expectedFoods,

                recommendations,

                precision:
                    metrics.precision,

                recall:
                    metrics.recall

            });

        }

    }

    // ========================================
    // Final metrics
    // ========================================

    const precisionAt5 =
        evaluationSamples > 0

            ? totalPrecision /
            evaluationSamples

            : 0;

    const recallAt5 =
        evaluationSamples > 0

            ? totalRecall /
            evaluationSamples

            : 0;

    console.log(
        "\n========================================"
    );

    console.log(
        "EVALUATION RESULTS"
    );

    console.log(
        "========================================\n"
    );

    console.log(
        "Evaluation samples:",
        evaluationSamples
    );

    console.log(
        "Total hits:",
        totalHits
    );

    console.log(
        "Precision@5:",
        precisionAt5.toFixed(4)
    );

    console.log(
        "Recall@5:",
        recallAt5.toFixed(4)
    );

    // ========================================
    // Sample results
    // ========================================
    //
    // IMPORTANT:
    //
    // We print names instead of UUIDs
    // so we can inspect the quality of
    // companion recommendations.
    // ========================================

    console.log(
        "\n========================================"
    );

    console.log(
        "SAMPLE COMPANION RECOMMENDATIONS"
    );

    console.log(
        "========================================\n"
    );

    for (
        const result
        of results.slice(0, 10)
    ) {

        const triggerFood =
            foodMap[
            result.triggerFoodId
            ];

        console.log(
            "Trigger Food:",
            triggerFood?.name
            || result.triggerFoodId
        );

        console.log(
            "Trigger Category:",
            triggerFood?.category
            || "Unknown"
        );

        // =================================
        // Expected companions
        // =================================

        console.log(
            "Expected companions:"
        );

        for (
            const foodId
            of result.expectedFoods
        ) {

            const food =
                foodMap[foodId];

            console.log(

                " -",

                food?.name
                || foodId,

                food?.category
                    ? `(${food.category})`
                    : ""

            );

        }

        // =================================
        // Recommendations
        // =================================

        console.log(
            "Recommendations:"
        );

        for (
            const foodId
            of result.recommendations
        ) {

            const food =
                foodMap[foodId];

            console.log(

                " -",

                food?.name
                || foodId,

                food?.category
                    ? `(${food.category})`
                    : ""

            );

        }

        // =================================
        // Metrics for this sample
        // =================================

        console.log(
            "Precision:",
            result.precision.toFixed(4)
        );

        console.log(
            "Recall:",
            result.recall.toFixed(4)
        );

        console.log(
            "----------------------------------------"
        );

    }

    // ========================================
    // Summary
    // ========================================

    console.log(
        "\n========================================"
    );

    console.log(
        "SUMMARY"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Precision@${K}:`,
        precisionAt5.toFixed(4)
    );

    console.log(
        `Recall@${K}:`,
        recallAt5.toFixed(4)
    );

    console.log(
        "========================================\n"
    );
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

    .finally(
        async () => {

            await prisma.$disconnect();

        }
    );