import prisma from "./src/config/prisma.js";

async function checkDataset() {

    console.log("\n==============================");
    console.log("DATASET ANALYSIS");
    console.log("==============================\n");


    // -----------------------------
    // 1. تعداد کاربران
    // -----------------------------

    const userCount = await prisma.user.count();

    console.log("Users:", userCount);


    // -----------------------------
    // 2. تعداد سفارش‌ها
    // -----------------------------

    const orderCount = await prisma.order.count();

    const deliveredOrderCount =
        await prisma.order.count({
            where: {
                status: "DELIVERED"
            }
        });

    console.log("Orders:", orderCount);
    console.log("Delivered Orders:", deliveredOrderCount);


    // -----------------------------
    // 3. تعداد OrderItem
    // -----------------------------

    const orderItemCount =
        await prisma.orderItem.count();

    const deliveredOrderItemCount =
        await prisma.orderItem.count({
            where: {
                order: {
                    status: "DELIVERED"
                }
            }
        });

    console.log("OrderItems:", orderItemCount);
    console.log(
        "Delivered OrderItems:",
        deliveredOrderItemCount
    );


    // -----------------------------
    // 4. تعداد غذاها
    // -----------------------------

    const foodCount =
        await prisma.food.count();

    const activeFoodCount =
        await prisma.food.count({
            where: {
                isActive: true
            }
        });

    console.log("Foods:", foodCount);
    console.log("Active Foods:", activeFoodCount);


    // -----------------------------
    // 5. تعداد دسته‌بندی‌ها
    // -----------------------------

    const categoryCount =
        await prisma.category.count();

    console.log(
        "Categories:",
        categoryCount
    );


    // -----------------------------
    // 6. چند غذای مختلف واقعاً
    //    خریداری شده؟
    // -----------------------------

    const deliveredItems =
        await prisma.orderItem.findMany({

            where: {
                order: {
                    status: "DELIVERED"
                }
            },

            select: {
                foodId: true
            }

        });

    const uniqueFoodIds =
        new Set(
            deliveredItems.map(
                item => item.foodId
            )
        );

    console.log(
        "Unique Purchased Foods:",
        uniqueFoodIds.size
    );


    // -----------------------------
    // 7. تعداد غذای خریداری‌شده
    //    برای هر User
    // -----------------------------

    const users =
        await prisma.user.findMany({

            select: {
                id: true,
                firstName: true,
                lastName: true
            },

            orderBy: {
                firstName: "asc"
            }

        });


    console.log(
        "\n=============================="
    );

    console.log(
        "PURCHASES PER USER"
    );

    console.log(
        "==============================\n"
    );


    for (const user of users) {

        const items =
            await prisma.orderItem.findMany({

                where: {
                    order: {
                        userId: user.id,
                        status: "DELIVERED"
                    }
                },

                select: {
                    foodId: true
                }

            });


        const uniqueFoods =
            new Set(
                items.map(
                    item => item.foodId
                )
            );


        console.log(
            `${user.firstName} ${user.lastName} | ` +
            `OrderItems: ${items.length} | ` +
            `Unique Foods: ${uniqueFoods.size}`
        );

    }


    // -----------------------------
    // 8. غذاهایی که بیشتر خرید شده‌اند
    // -----------------------------

    const foods =
        await prisma.food.findMany({

            include: {
                category: true
            }

        });


    console.log(
        "\n=============================="
    );

    console.log(
        "FOOD PURCHASE FREQUENCY"
    );

    console.log(
        "==============================\n"
    );


    const foodPurchaseCounts = {};


    for (const item of deliveredItems) {

        if (!foodPurchaseCounts[item.foodId]) {

            foodPurchaseCounts[item.foodId] = 0;

        }

        foodPurchaseCounts[item.foodId]++;

    }


    const foodStats =
        foods
            .map(food => ({

                name: food.name,

                category:
                    food.category?.name,

                purchases:
                    foodPurchaseCounts[food.id] || 0

            }))
            .filter(
                food =>
                    food.purchases > 0
            )
            .sort(
                (a, b) =>
                    b.purchases -
                    a.purchases
            );


    console.table(
        foodStats.slice(0, 20)
    );


    // -----------------------------
    // 9. Pair های غذایی
    // -----------------------------
    // مهم‌ترین قسمت برای
    // Others Also Bought
    // -----------------------------

    const deliveredOrders =
        await prisma.order.findMany({

            where: {
                status: "DELIVERED"
            },

            select: {

                id: true,

                orderItems: {

                    select: {
                        foodId: true
                    }

                }

            }

        });


    const pairs = {};


    for (const order of deliveredOrders) {

        const foodIds = [
            ...new Set(
                order.orderItems.map(
                    item => item.foodId
                )
            )
        ];


        for (
            let i = 0;
            i < foodIds.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < foodIds.length;
                j++
            ) {

                const a =
                    foodIds[i];

                const b =
                    foodIds[j];


                const key =
                    [a, b]
                        .sort()
                        .join("_");


                if (!pairs[key]) {

                    pairs[key] = {

                        foodA: a,

                        foodB: b,

                        count: 0

                    };

                }


                pairs[key].count++;

            }

        }

    }


    const foodMap =
        new Map(
            foods.map(
                food => [
                    food.id,
                    food.name
                ]
            )
        );


    const pairStats =
        Object.values(pairs)
            .map(pair => ({

                foodA:
                    foodMap.get(
                        pair.foodA
                    ),

                foodB:
                    foodMap.get(
                        pair.foodB
                    ),

                timesTogether:
                    pair.count

            }))
            .sort(
                (a, b) =>
                    b.timesTogether -
                    a.timesTogether
            );


    console.log(
        "\n=============================="
    );

    console.log(
        "FOOD PAIRS"
    );

    console.log(
        "==============================\n"
    );


    console.table(
        pairStats.slice(0, 20)
    );


    // -----------------------------
    // 10. میانگین OrderItem
    //    در هر سفارش
    // -----------------------------

    const averageItemsPerOrder =
        deliveredOrderCount > 0
            ? deliveredOrderItemCount /
            deliveredOrderCount
            : 0;


    console.log(
        "\nAverage Items per Delivered Order:",
        averageItemsPerOrder.toFixed(2)
    );


    console.log(
        "\n=============================="
    );

    console.log(
        "DATASET ANALYSIS FINISHED"
    );

    console.log(
        "==============================\n"
    );

}


checkDataset()

    .catch(error => {

        console.error(
            "Dataset analysis failed:",
            error
        );

    })

    .finally(async () => {

        await prisma.$disconnect();

    });