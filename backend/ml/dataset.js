import prisma from "../src/config/prisma.js";

async function checkDataset() {

    console.log("\n========================================");
    console.log("FOODSTORE ML DATASET STATISTICS");
    console.log("========================================\n");


    // =====================================================
    // 1. DELIVERED ORDERS
    // =====================================================

    const deliveredOrders =
        await prisma.order.findMany({

            where: {
                status: "DELIVERED"
            },

            select: {

                id: true,
                userId: true,
                restaurantId: true,

                orderItems: {
                    select: {
                        foodId: true
                    }
                }

            }

        });


    console.log(
        "Delivered Orders:",
        deliveredOrders.length
    );


    // =====================================================
    // 2. BUILD INTERACTIONS
    // =====================================================

    const interactions = [];

    for (const order of deliveredOrders) {

        const foodIds = [
            ...new Set(
                order.orderItems.map(
                    item => item.foodId
                )
            )
        ];

        for (const foodId of foodIds) {

            interactions.push({

                userId: order.userId,
                restaurantId: order.restaurantId,
                foodId

            });

        }

    }


    // =====================================================
    // 3. GLOBAL STATISTICS
    // =====================================================

    const uniqueUsers =
        new Set(
            interactions.map(
                item => item.userId
            )
        );

    const uniqueFoods =
        new Set(
            interactions.map(
                item => item.foodId
            )
        );

    const uniqueRestaurants =
        new Set(
            interactions.map(
                item => item.restaurantId
            )
        );


    console.log("\n========================================");
    console.log("GLOBAL STATISTICS");
    console.log("========================================\n");

    console.log(
        "Users with interactions:",
        uniqueUsers.size
    );

    console.log(
        "Foods with interactions:",
        uniqueFoods.size
    );

    console.log(
        "Restaurants with interactions:",
        uniqueRestaurants.size
    );

    console.log(
        "User-Food interactions:",
        interactions.length
    );


    // =====================================================
    // 4. STATISTICS PER RESTAURANT
    // =====================================================

    const restaurants =
        await prisma.restaurant.findMany({

            select: {
                id: true,
                name: true
            },

            orderBy: {
                name: "asc"
            }

        });


    console.log("\n========================================");
    console.log("STATISTICS PER RESTAURANT");
    console.log("========================================\n");


    for (const restaurant of restaurants) {

        const restaurantOrders =
            deliveredOrders.filter(
                order =>
                    order.restaurantId === restaurant.id
            );


        const restaurantInteractions =
            interactions.filter(
                interaction =>
                    interaction.restaurantId === restaurant.id
            );


        const restaurantUsers =
            new Set(
                restaurantInteractions.map(
                    item => item.userId
                )
            );


        const restaurantFoods =
            new Set(
                restaurantInteractions.map(
                    item => item.foodId
                )
            );


        console.log(
            `\n🍽️ ${restaurant.name}`
        );

        console.log(
            "Orders:",
            restaurantOrders.length
        );

        console.log(
            "Users:",
            restaurantUsers.size
        );

        console.log(
            "Foods ordered:",
            restaurantFoods.size
        );

        console.log(
            "Interactions:",
            restaurantInteractions.length
        );

    }


    // =====================================================
    // 5. FOODS WITHOUT ORDERS
    // =====================================================

    const allFoods =
        await prisma.food.findMany({

            select: {
                id: true,
                name: true,
                restaurantId: true,

                restaurant: {
                    select: {
                        name: true
                    }
                }

            },

            orderBy: {
                name: "asc"
            }

        });


    const orderedFoodIds =
        new Set(
            interactions.map(
                item => item.foodId
            )
        );


    const foodsWithoutOrders =
        allFoods.filter(
            food =>
                !orderedFoodIds.has(food.id)
        );


    console.log("\n========================================");
    console.log("FOODS WITHOUT ORDERS");
    console.log("========================================\n");

    console.log(
        "Total:",
        foodsWithoutOrders.length
    );


    for (const food of foodsWithoutOrders) {

        console.log(
            `${food.restaurant.name} → ${food.name}`
        );

    }


    // =====================================================
    // 6. ORDERED FOODS WITH ORDER COUNT
    // =====================================================

    const foodOrderCounts = {};


    for (const interaction of interactions) {

        if (!foodOrderCounts[interaction.foodId]) {
            foodOrderCounts[interaction.foodId] = 0;
        }

        foodOrderCounts[interaction.foodId]++;

    }


    const orderedFoodDetails =
        allFoods

            .filter(
                food =>
                    foodOrderCounts[food.id]
            )

            .map(
                food => ({

                    restaurant:
                        food.restaurant.name,

                    food:
                        food.name,

                    interactions:
                        foodOrderCounts[food.id]

                })
            )

            .sort(
                (a, b) =>
                    b.interactions -
                    a.interactions
            );


    console.log("\n========================================");
    console.log("MOST ORDERED FOODS");
    console.log("========================================\n");


    console.table(
        orderedFoodDetails
    );


    // =====================================================
    // 7. USER ACTIVITY
    // =====================================================

    const userInteractionCounts = {};


    for (const interaction of interactions) {

        if (!userInteractionCounts[interaction.userId]) {
            userInteractionCounts[interaction.userId] = 0;
        }

        userInteractionCounts[interaction.userId]++;

    }


    const userStats =
        Object.entries(
            userInteractionCounts
        )

            .map(
                ([userId, interactionsCount]) => ({

                    userId,
                    interactions: interactionsCount

                })
            )

            .sort(
                (a, b) =>
                    b.interactions -
                    a.interactions
            );


    console.log("\n========================================");
    console.log("USER ACTIVITY");
    console.log("========================================\n");

    console.table(userStats);


    // =====================================================
    // 8. AVERAGE INTERACTIONS
    // =====================================================

    const averageInteractionsPerUser =
        uniqueUsers.size
            ? (
                interactions.length /
                uniqueUsers.size
            ).toFixed(2)
            : 0;


    const averageInteractionsPerFood =
        uniqueFoods.size
            ? (
                interactions.length /
                uniqueFoods.size
            ).toFixed(2)
            : 0;


    console.log("\n========================================");
    console.log("AVERAGES");
    console.log("========================================\n");

    console.log(
        "Average interactions per user:",
        averageInteractionsPerUser
    );

    console.log(
        "Average interactions per food:",
        averageInteractionsPerFood
    );


    // =====================================================
    // FINISH
    // =====================================================

    console.log("\n========================================");
    console.log("DATASET CHECK COMPLETED");
    console.log("========================================\n");


    await prisma.$disconnect();

}


checkDataset()
    .catch(error => {

        console.error(
            "\n❌ Dataset check failed:",
            error
        );

        prisma.$disconnect();

    });