// ========================================
// FoodStore Recommendation Model
// Item-Based CF + Basket Co-Purchase
// ========================================

const K = 5;

// وزن‌های مدل
const WEIGHTS = {
    PERSONAL: 0.55,
    COPURCHASE: 0.35,
    POPULARITY: 0.10
};

// ========================================
// Helpers
// ========================================

function ensureObject(object, key) {
    if (!object[key]) {
        object[key] = {};
    }

    return object[key];
}

function increment(object, key, value = 1) {
    object[key] = (object[key] || 0) + value;
}

// ========================================
// 1. Build model
// ========================================

export function buildModel(orders) {
    const userRestaurantFoodCounts = {};
    const restaurantFoodUsers = {};
    const restaurantFoodPairCounts = {};
    const restaurantFoodOrderCounts = {};

    for (const order of orders) {
        const {
            userId,
            restaurantId
        } = order;

        const foodIds = [
            ...new Set(
                order.orderItems.map(
                    item => item.foodId
                )
            )
        ];

        if (foodIds.length === 0) {
            continue;
        }

        // --------------------------------
        // User -> Restaurant -> Food
        // --------------------------------

        const userRestaurants =
            ensureObject(
                userRestaurantFoodCounts,
                userId
            );

        const userFoods =
            ensureObject(
                userRestaurants,
                restaurantId
            );

        for (const foodId of foodIds) {
            increment(userFoods, foodId);
        }

        // --------------------------------
        // Restaurant -> Food -> Users
        // --------------------------------

        const restaurantUsers =
            ensureObject(
                restaurantFoodUsers,
                restaurantId
            );

        for (const foodId of foodIds) {
            const foodUsers =
                ensureObject(
                    restaurantUsers,
                    foodId
                );

            increment(foodUsers, userId);
        }

        // --------------------------------
        // Popularity
        // --------------------------------

        const restaurantPopularity =
            ensureObject(
                restaurantFoodOrderCounts,
                restaurantId
            );

        for (const foodId of foodIds) {
            increment(
                restaurantPopularity,
                foodId
            );
        }

        // --------------------------------
        // Co-Purchase
        //
        // Every pair appearing in the
        // same basket gets one signal.
        // --------------------------------

        const restaurantPairs =
            ensureObject(
                restaurantFoodPairCounts,
                restaurantId
            );

        for (let i = 0; i < foodIds.length; i++) {

            const foodA =
                foodIds[i];

            const foodPairs =
                ensureObject(
                    restaurantPairs,
                    foodA
                );

            for (
                let j = 0;
                j < foodIds.length;
                j++
            ) {

                if (i === j) {
                    continue;
                }

                const foodB =
                    foodIds[j];

                increment(
                    foodPairs,
                    foodB
                );
            }
        }
    }

    const similarityMatrix =
        buildSimilarityMatrix(
            restaurantFoodUsers
        );

    const coPurchaseMatrix =
        buildCoPurchaseMatrix(
            restaurantFoodPairCounts
        );

    return {
        userRestaurantFoodCounts,
        restaurantFoodUsers,
        restaurantFoodOrderCounts,
        restaurantFoodPairCounts,
        similarityMatrix,
        coPurchaseMatrix
    };
}

// ========================================
// 2. Item-Based CF
// ========================================

function buildSimilarityMatrix(
    restaurantFoodUsers
) {

    const matrix = {};

    for (
        const restaurantId
        of Object.keys(
            restaurantFoodUsers
        )
    ) {

        matrix[restaurantId] = {};

        const foods =
            Object.keys(
                restaurantFoodUsers[
                restaurantId
                ]
            );

        for (const foodA of foods) {

            matrix[restaurantId][foodA] = {};

            const usersA =
                new Set(
                    Object.keys(
                        restaurantFoodUsers[
                        restaurantId
                        ][foodA]
                    )
                );

            for (const foodB of foods) {

                if (foodA === foodB) {
                    continue;
                }

                const usersB =
                    new Set(
                        Object.keys(
                            restaurantFoodUsers[
                            restaurantId
                            ][foodB]
                        )
                    );

                let intersection = 0;

                for (const user of usersA) {

                    if (usersB.has(user)) {
                        intersection++;
                    }
                }

                const union =
                    new Set([
                        ...usersA,
                        ...usersB
                    ]).size;

                const similarity =
                    union > 0
                        ? intersection / union
                        : 0;

                matrix[
                    restaurantId
                ][foodA][foodB] =
                    similarity;
            }
        }
    }

    return matrix;
}

// ========================================
// 3. Co-Purchase normalization
// ========================================
//
// Jaccard-like normalization:
//
// pairCount / (ordersContainingA +
//              ordersContainingB - pairCount)
//
// This prevents very popular foods from
// dominating every recommendation.
// ========================================

function buildCoPurchaseMatrix(
    pairCounts
) {

    const matrix = {};

    for (
        const restaurantId
        of Object.keys(pairCounts)
    ) {

        matrix[restaurantId] = {};

        const restaurantPairs =
            pairCounts[
            restaurantId
            ];

        for (
            const foodA
            of Object.keys(
                restaurantPairs
            )
        ) {

            matrix[
                restaurantId
            ][foodA] = {};

            for (
                const foodB
                of Object.keys(
                    restaurantPairs[
                    foodA
                    ]
                )
            ) {

                const pairCount =
                    restaurantPairs[
                    foodA
                    ][foodB];

                matrix[
                    restaurantId
                ][foodA][foodB] =
                    pairCount;
            }
        }
    }

    return matrix;
}

// ========================================
// 4. Personal score
// ========================================

function calculatePersonalScore(
    userId,
    restaurantId,
    candidateFoodId,
    model
) {

    const purchasedFoods =
        model
            .userRestaurantFoodCounts[
        userId
        ]?.[
        restaurantId
        ] || {};

    let score = 0;

    for (
        const [
            purchasedFoodId,
            purchaseCount
        ]
        of Object.entries(
            purchasedFoods
        )
    ) {

        if (
            purchasedFoodId ===
            candidateFoodId
        ) {
            continue;
        }

        const similarity =
            model
                .similarityMatrix[
            restaurantId
            ]?.[
            purchasedFoodId
            ]?.[
            candidateFoodId
            ] || 0;

        const purchaseWeight =
            Math.log(
                1 + purchaseCount
            );

        score +=
            similarity *
            purchaseWeight;
    }

    return score;
}

// ========================================
// 5. Co-Purchase score
// ========================================

function calculateCoPurchaseScore(
    triggerFoodIds,
    candidateFoodId,
    restaurantId,
    model
) {

    let score = 0;

    for (
        const triggerFoodId
        of triggerFoodIds
    ) {

        if (
            triggerFoodId ===
            candidateFoodId
        ) {
            continue;
        }

        const pairCount =
            model
                .coPurchaseMatrix[
            restaurantId
            ]?.[
            triggerFoodId
            ]?.[
            candidateFoodId
            ] || 0;

        score += pairCount;
    }

    return score;
}

// ========================================
// 6. Normalize scores
// ========================================

function normalizeScores(
    scoredFoods
) {

    if (
        scoredFoods.length === 0
    ) {
        return scoredFoods;
    }

    const maxPersonal =
        Math.max(
            ...scoredFoods.map(
                item =>
                    item.personalScore
            )
        );

    const maxCoPurchase =
        Math.max(
            ...scoredFoods.map(
                item =>
                    item.coPurchaseScore
            )
        );

    const maxPopularity =
        Math.max(
            ...scoredFoods.map(
                item =>
                    item.popularity
            )
        );

    return scoredFoods.map(
        item => {

            const personal =
                maxPersonal > 0
                    ? item.personalScore /
                    maxPersonal
                    : 0;

            const coPurchase =
                maxCoPurchase > 0
                    ? item.coPurchaseScore /
                    maxCoPurchase
                    : 0;

            const popularity =
                maxPopularity > 0
                    ? item.popularity /
                    maxPopularity
                    : 0;

            return {
                ...item,
                personal,
                coPurchase,
                popularityNormalized:
                    popularity
            };
        }
    );
}

// ========================================
// 7. Personalized recommendation
// ========================================

export function recommendForUser(
    userId,
    restaurantId,
    model,
    limit = K
) {

    const userFoods =
        model
            .userRestaurantFoodCounts[
        userId
        ]?.[
        restaurantId
        ] || {};

    const purchasedFoodIds =
        Object.keys(
            userFoods
        );

    const restaurantFoods =
        model
            .restaurantFoodOrderCounts[
        restaurantId
        ] || {};

    const scoredFoods = [];

    for (
        const candidateFoodId
        of Object.keys(
            restaurantFoods
        )
    ) {

        const personalScore =
            calculatePersonalScore(
                userId,
                restaurantId,
                candidateFoodId,
                model
            );

        const coPurchaseScore =
            calculateCoPurchaseScore(
                purchasedFoodIds,
                candidateFoodId,
                restaurantId,
                model
            );

        const popularity =
            restaurantFoods[
            candidateFoodId
            ] || 0;

        scoredFoods.push({
            foodId:
                candidateFoodId,
            personalScore,
            coPurchaseScore,
            popularity
        });
    }

    const normalized =
        normalizeScores(
            scoredFoods
        );

    normalized.sort(
        (a, b) => {

            const scoreA =
                WEIGHTS.PERSONAL *
                a.personal +

                WEIGHTS.COPURCHASE *
                a.coPurchase +

                WEIGHTS.POPULARITY *
                a.popularityNormalized;

            const scoreB =
                WEIGHTS.PERSONAL *
                b.personal +

                WEIGHTS.COPURCHASE *
                b.coPurchase +

                WEIGHTS.POPULARITY *
                b.popularityNormalized;

            return scoreB - scoreA;
        }
    );

    return normalized
        .slice(0, limit)
        .map(
            item =>
                item.foodId
        );
}

// ========================================
// 8. Companion recommendation
// ========================================
//
// Used when the user has selected a food
// or has items in the cart.
//
// IMPORTANT:
// Previously purchased foods ARE allowed.
// The goal is "things you may like"
// and/or "usually ordered together".
// ========================================

export function recommendCompanions(
    restaurantId,
    triggerFoodIds,
    model,
    limit = K
) {

    const restaurantFoods =
        model
            .restaurantFoodOrderCounts[
        restaurantId
        ] || {};

    const scoredFoods = [];

    for (
        const candidateFoodId
        of Object.keys(
            restaurantFoods
        )
    ) {

        if (
            triggerFoodIds.includes(
                candidateFoodId
            )
        ) {
            continue;
        }

        const coPurchaseScore =
            calculateCoPurchaseScore(
                triggerFoodIds,
                candidateFoodId,
                restaurantId,
                model
            );

        const popularity =
            restaurantFoods[
            candidateFoodId
            ] || 0;

        scoredFoods.push({
            foodId:
                candidateFoodId,
            coPurchaseScore,
            popularity
        });
    }

    const maxCoPurchase =
        Math.max(
            0,
            ...scoredFoods.map(
                item =>
                    item.coPurchaseScore
            )
        );

    const maxPopularity =
        Math.max(
            0,
            ...scoredFoods.map(
                item =>
                    item.popularity
            )
        );

    for (
        const item
        of scoredFoods
    ) {

        item.coPurchaseNormalized =
            maxCoPurchase > 0
                ? item.coPurchaseScore /
                maxCoPurchase
                : 0;

        item.popularityNormalized =
            maxPopularity > 0
                ? item.popularity /
                maxPopularity
                : 0;

        item.finalScore =
            0.85 *
            item.coPurchaseNormalized +

            0.15 *
            item.popularityNormalized;
    }

    scoredFoods.sort(
        (a, b) =>
            b.finalScore -
            a.finalScore
    );

    return scoredFoods
        .slice(0, limit)
        .map(
            item =>
                item.foodId
        );
}