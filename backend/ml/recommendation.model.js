const K = 5;

const WEIGHTS = {
    PERSONAL: 0.55,
    COPURCHASE: 0.35,
    POPULARITY: 0.10
};


// =====================================================
// Helpers
// =====================================================

function ensureObject(object, key) {

    if (!object[key]) {
        object[key] = {};
    }

    return object[key];
}


function increment(object, key, value = 1) {

    object[key] =
        (object[key] || 0) + value;
}


// =====================================================
// Build Model
// =====================================================

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


        // =================================================
        // فقط Foodهای معتبر همان Restaurant
        // =================================================

        const validFoodIds = [
            ...new Set(

                order.orderItems
                    .filter(item => {

                        /*
                         * Food باید وجود داشته باشد.
                         */

                        if (!item.food) {
                            return false;
                        }


                        /*
                         * مهم‌ترین فیلتر Model:
                         *
                         * Food باید واقعاً متعلق
                         * به Restaurant سفارش باشد.
                         */

                        return (
                            item.food.restaurantId ===
                            restaurantId
                        );

                    })
                    .map(
                        item =>
                            item.foodId
                    )

            )
        ];


        /*
         * اگر Order هیچ Food معتبر نداشت،
         * در Model استفاده نمی‌شود.
         */

        if (
            validFoodIds.length === 0
        ) {
            continue;
        }


        // =================================================
        // User → Restaurant → Food
        // =================================================

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


        for (
            const foodId
            of validFoodIds
        ) {

            increment(
                userFoods,
                foodId
            );

        }


        // =================================================
        // Restaurant → Food → Users
        // =================================================

        const restaurantUsers =
            ensureObject(
                restaurantFoodUsers,
                restaurantId
            );


        for (
            const foodId
            of validFoodIds
        ) {

            const foodUsers =
                ensureObject(
                    restaurantUsers,
                    foodId
                );


            increment(
                foodUsers,
                userId
            );

        }


        // =================================================
        // Restaurant → Food → Order Count
        // =================================================

        const restaurantPopularity =
            ensureObject(
                restaurantFoodOrderCounts,
                restaurantId
            );


        for (
            const foodId
            of validFoodIds
        ) {

            increment(
                restaurantPopularity,
                foodId
            );

        }


        // =================================================
        // Restaurant → Food → Food
        // Co-Purchase
        // =================================================

        const restaurantPairs =
            ensureObject(
                restaurantFoodPairCounts,
                restaurantId
            );


        for (
            let i = 0;
            i < validFoodIds.length;
            i++
        ) {

            const foodA =
                validFoodIds[i];


            const foodPairs =
                ensureObject(
                    restaurantPairs,
                    foodA
                );


            for (
                let j = 0;
                j < validFoodIds.length;
                j++
            ) {

                if (i === j) {
                    continue;
                }


                const foodB =
                    validFoodIds[j];


                /*
                 * چون validFoodIds از همین
                 * Restaurant ساخته شده،
                 * این Pair هم قطعاً متعلق
                 * به همین Restaurant است.
                 */

                increment(
                    foodPairs,
                    foodB
                );

            }

        }

    }


    // =====================================================
    // Build Similarity
    // =====================================================

    const similarityMatrix =
        buildSimilarityMatrix(
            restaurantFoodUsers
        );


    // =====================================================
    // Build Co-Purchase
    // =====================================================

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


// =====================================================
// Item-Based Similarity
// =====================================================

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


        for (
            const foodA
            of foods
        ) {

            matrix[
                restaurantId
            ][foodA] = {};


            const usersA =
                new Set(
                    Object.keys(
                        restaurantFoodUsers[
                        restaurantId
                        ][foodA]
                    )
                );


            for (
                const foodB
                of foods
            ) {

                if (
                    foodA === foodB
                ) {
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


                for (
                    const user
                    of usersA
                ) {

                    if (
                        usersB.has(user)
                    ) {

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


// =====================================================
// Co-Purchase Matrix
// =====================================================

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
                    restaurantPairs[foodA]
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


// =====================================================
// Personal Recommendation Score
// =====================================================

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

        /*
         * =================================================
         * 1. خرید تکراری خودِ غذا
         * =================================================
         *
         * اگر کاربر قبلاً همین غذا را خریده باشد،
         * این یک سیگنال مستقیم از علاقه‌ی کاربر است.
         *
         * هرچه تعداد خرید بیشتر باشد،
         * امتیاز بیشتر می‌شود.
         *
         * از log استفاده می‌کنیم تا مثلاً خرید 20 باره
         * بیش از حد مدل را تحت تأثیر قرار ندهد.
         */

        if (
            purchasedFoodId ===
            candidateFoodId
        ) {

            score +=
                Math.log(
                    1 + purchaseCount
                );

            continue;
        }


        /*
         * =================================================
         * 2. شباهت به غذاهای قبلی کاربر
         * =================================================
         *
         * اگر غذا هنوز خریداری نشده باشد،
         * شباهت آن با غذاهایی که کاربر قبلاً خریده
         * تعیین می‌کند که چقدر به سلیقه‌ی او نزدیک است.
         */

        const similarity =
            model
                .similarityMatrix[
            restaurantId
            ]?.[
            purchasedFoodId
            ]?.[
            candidateFoodId
            ] || 0;


        /*
         * خرید بیشتر یک غذای قبلی،
         * اهمیت آن غذا را برای تشخیص سلیقه‌ی کاربر
         * بیشتر می‌کند.
         */

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


// =====================================================
// Co-Purchase Score
// =====================================================

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


// =====================================================
// Normalize Scores
// =====================================================

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


// =====================================================
// Personalized Recommendation
// =====================================================

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


    // =================================================
    // Candidateها فقط از همان Restaurant
    // =================================================

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


        console.log(
            "PERSONAL SCORE:",
            {
                foodId: candidateFoodId,
                purchaseCount:
                    userFoods[candidateFoodId] || 0,
                personalScore,
                coPurchaseScore,
                popularity
            }
        );

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
        .map(item => {

            const score =
                WEIGHTS.PERSONAL *
                item.personal +

                WEIGHTS.COPURCHASE *
                item.coPurchase +

                WEIGHTS.POPULARITY *
                item.popularityNormalized;


            return {

                foodId:
                    item.foodId,

                score

            };

        });
}


// =====================================================
// Companion Recommendation
// =====================================================

export function recommendCompanions(
    restaurantId,
    triggerFoodIds,
    model,
    limit = K
) {

    /*
     * Candidateها فقط از همان Restaurant.
     */

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

        /*
         * Trigger خودش پیشنهاد نشود.
         */

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


        /*
         * خیلی مهم:
         *
         * اگر این غذا هیچ‌وقت همراه هیچ‌کدام
         * از غذاهای Cart خریداری نشده باشد،
         * اصلاً Companion محسوب نمی‌شود.
         */

        if (
            coPurchaseScore <= 0
        ) {
            continue;
        }


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


    // =================================================
    // اگر هیچ رابطه Co-Purchase وجود نداشت
    // =================================================

    if (
        scoredFoods.length === 0
    ) {

        return [];

    }


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


        /*
         * Co-Purchase عامل اصلی است.
         * Popularity فقط tie-break / تقویت جزئی است.
         */

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
        .map(item => ({

            foodId:
                item.foodId,

            score:
                item.finalScore

        }));

}