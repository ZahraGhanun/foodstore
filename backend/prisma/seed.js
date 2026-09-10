/*
برای اجرا اول سرچ کن
CREATE ORDERS
و کد ثبت سفارشات رو از کامنت دربیار
اگر این قسمت کد دوبار اجرا بشه دیتای تکراری وارد دیتابیس میشه! 
*/

import { orderData } from "./seed-data/orders.js";
import { reviewData } from "./seed-data/reviews.js";
import { restaurantsData } from "./seed-data/restaurants.js";
import { restaurantMenus } from "./seed-data/menus.js";
import {
    customerData,
    managerData,
    adminData,
    driverData
} from "./seed-data/users.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();


// =====================================================
// CREATE USER
// =====================================================

async function createUser({
    firstName,
    lastName,
    phone,
    email,
    password,
    roleName
}) {

    const role = await prisma.role.findUnique({
        where: {
            name: roleName
        }
    });

    if (!role) {
        throw new Error(`${roleName} role not found.`);
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            phone
        }
    });

    if (existingUser) {

        console.log(
            `ℹ️ ${roleName} already exists: ${phone}`
        );

        return existingUser;

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const user = await prisma.user.create({

        data: {

            firstName,
            lastName,
            phone,
            email,
            passwordHash: hashedPassword,

            userRoles: {

                create: {

                    roleId: role.id

                }

            }

        }

    });

    console.log(
        `✅ ${roleName} created: ${email}`
    );

    return user;

}


// =====================================================
// MAIN
// =====================================================

async function main() {

    console.log("🌱 Seeding database...");


    // =================================================
    // ROLES
    // =================================================

    const roles = [

        {
            name: "Customer",
            description: "Regular customer"
        },

        {
            name: "RestaurantManager",
            description: "Restaurant manager"
        },

        {
            name: "Driver",
            description: "Delivery driver"
        },

        {
            name: "SystemAdmin",
            description: "System administrator"
        }

    ];

    for (const role of roles) {

        await prisma.role.upsert({

            where: {
                name: role.name
            },

            update: {},

            create: role

        });

    }

    console.log("✅ Roles seeded.");


    // =================================================
    // SYSTEM ADMIN
    // =================================================

    await createUser({

        ...adminData,

        password: "123456",

        roleName: "SystemAdmin"

    });

    // =================================================
    // CUSTOMERS
    // =================================================

    const customers = [];

    for (const data of customerData) {

        const customer = await createUser({

            ...data,

            password: "123456",

            roleName: "Customer"

        });

        customers.push(customer);

    }

    console.log("✅ 30 Customers ready.");


    // =================================================
    // CUSTOMER DELIVERY ADDRESSES
    // =================================================

    for (let i = 0; i < customers.length; i++) {

        const customer = customers[i];

        const existingAddress =
            await prisma.deliveryAddress.findFirst({

                where: {
                    userId: customer.id
                }

            });

        if (existingAddress) {

            console.log(
                `ℹ️ Address already exists for ${customer.email}`
            );

            continue;

        }

        await prisma.deliveryAddress.create({

            data: {

                userId: customer.id,

                title: "Home",

                receiverName:
                    `${customer.firstName} ${customer.lastName}`,

                receiverPhone:
                    customer.phone,

                address:
                    `Tehran, Valiasr Street, No. ${100 + i}`,

                isDefault: true

            }

        });

    }

    console.log("✅ Delivery addresses created for all customers.");

    // =================================================
    // RESTAURANT MANAGERS
    // =================================================

    const managers = [];


    for (let i = 0; i < managerData.length; i++) {

        const [
            firstName,
            lastName,
            phone,
            email
        ] = managerData[i];

        const manager = await createUser({

            firstName,
            lastName,
            phone,
            email,

            password: "123456",

            roleName: "RestaurantManager"

        });

        managers.push(manager);

    }

    console.log("✅ 10 Restaurant Managers ready.");


    // =================================================
    // DRIVER
    // =================================================

    await createUser({

        ...driverData,

        password: "123456",

        roleName: "Driver"

    });


    // =================================================
    // CREATE RESTAURANTS
    // =================================================

    const restaurants = [];

    for (let i = 0; i < restaurantsData.length; i++) {

        const data = restaurantsData[i];

        const manager = managers[i];

        const restaurant =
            await prisma.restaurant.upsert({

                where: {
                    slug: data.slug
                },

                update: {

                    name: data.name,
                    description: data.description,
                    phone: data.phone,
                    address: data.address,
                    minimumOrder: data.minimumOrder,
                    deliveryFee: data.deliveryFee,
                    managerId: manager.id

                },

                create: {

                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    phone: data.phone,
                    address: data.address,
                    minimumOrder: data.minimumOrder,
                    deliveryFee: data.deliveryFee,
                    managerId: manager.id

                }

            });

        restaurants.push(restaurant);

    }

    console.log("✅ 10 restaurants ready.");


    // =================================================
    // CREATE CATEGORIES AND FOODS
    // =================================================

    let totalCategories = 0;
    let totalFoods = 0;

    for (let i = 0; i < restaurants.length; i++) {

        const restaurant =
            restaurants[i];

        const menu =
            restaurantMenus[i];

        for (
            let categoryIndex = 0;
            categoryIndex < menu.length;
            categoryIndex++
        ) {

            const categoryData =
                menu[categoryIndex];

            const category =
                await prisma.category.upsert({

                    where: {

                        restaurantId_name: {

                            restaurantId:
                                restaurant.id,

                            name:
                                categoryData.name

                        }

                    },

                    update: {

                        description:
                            `${categoryData.name} menu`,

                        displayOrder:
                            categoryIndex + 1,

                        isActive:
                            true

                    },

                    create: {

                        name:
                            categoryData.name,

                        description:
                            `${categoryData.name} menu`,

                        displayOrder:
                            categoryIndex + 1,

                        restaurantId:
                            restaurant.id

                    }

                });

            totalCategories++;


            // =========================================
            // FOODS
            // =========================================

            for (
                let foodIndex = 0;
                foodIndex < categoryData.foods.length;
                foodIndex++
            ) {

                const [
                    name,
                    description,
                    price
                ] =
                    categoryData.foods[foodIndex];

                const existingFood =
                    await prisma.food.findFirst({

                        where: {

                            restaurantId: restaurant.id,

                            name

                        }

                    });

                if (existingFood) {

                    await prisma.food.update({

                        where: {
                            id: existingFood.id
                        },

                        data: {

                            description,
                            price,

                            categoryId: category.id,

                            displayOrder:
                                foodIndex + 1,

                            isActive: true,

                            isAvailable: true

                        }

                    });

                    console.log(
                        `↻ Food updated: ${name} (${restaurant.name})`
                    );

                }
                else {

                    await prisma.food.create({

                        data: {

                            name,
                            description,
                            price,

                            restaurantId:
                                restaurant.id,

                            categoryId:
                                category.id,

                            displayOrder:
                                foodIndex + 1,

                            isActive: true,

                            isAvailable: true

                        }

                    });

                    console.log(
                        `✅ Food created: ${name} (${restaurant.name})`
                    );

                }






                totalFoods++;

            }

        }

    }


    console.log("✅ Categories and foods seeded.");




    // =====================================================
    // CREATE ORDERS
    // =====================================================

    let createdOrders = 0;
    let createdOrderItems = 0;

    for (const data of orderData) {

        // -------------------------------------------------
        // CUSTOMER
        // -------------------------------------------------

        const customer = customers[data.customer - 1];

        if (!customer) {
            throw new Error(
                `Customer ${data.customer} not found.`
            );
        }


        // -------------------------------------------------
        // DELIVERY ADDRESS
        // -------------------------------------------------

        const deliveryAddress =
            await prisma.deliveryAddress.findFirst({

                where: {
                    userId: customer.id
                }

            });

        if (!deliveryAddress) {
            throw new Error(
                `Delivery address not found for Customer ${data.customer}.`
            );
        }


        // -------------------------------------------------
        // RESTAURANT
        // -------------------------------------------------

        const restaurant =
            restaurants.find(
                r => r.slug === data.restaurant
            );

        if (!restaurant) {
            throw new Error(
                `Restaurant ${data.restaurant} not found.`
            );
        }


        // -------------------------------------------------
        // FIND FOODS
        // -------------------------------------------------

        const orderItemsData = [];

        let totalPrice = 0;

        for (const [foodName, quantity] of data.items) {

            const food =
                await prisma.food.findFirst({

                    where: {

                        restaurantId:
                            restaurant.id,

                        name:
                            foodName,

                        isActive: true,

                        isAvailable: true

                    }

                });

            if (!food) {

                throw new Error(
                    `Food "${foodName}" not found in ${restaurant.name}.`
                );

            }


            const unitPrice =
                Number(food.price);

            totalPrice +=
                unitPrice * quantity;


            orderItemsData.push({

                foodId:
                    food.id,

                quantity,

                unitPrice

            });

        }


        // -------------------------------------------------
        // CREATE ORDER
        // -------------------------------------------------

        const deliveryFee =
            Number(restaurant.deliveryFee);

        const finalPrice =
            totalPrice + deliveryFee;


        const order =
            await prisma.order.create({

                data: {

                    userId:
                        customer.id,

                    restaurantId:
                        restaurant.id,

                    deliveryAddressId:
                        deliveryAddress.id,

                    status:
                        data.status,

                    totalPrice,

                    deliveryFee,

                    finalPrice,

                    orderItems: {

                        create:
                            orderItemsData

                    }

                }

            });


        createdOrders++;

        createdOrderItems +=
            orderItemsData.length;


        console.log(
            `✅ Order ${createdOrders}/${orderData.length} created - Customer ${data.customer} - ${restaurant.name}`
        );

    }


    console.log("");

    console.log(
        `✅ ${createdOrders} orders created.`
    );

    console.log(
        `✅ ${createdOrderItems} order items created.`
    );



    // =====================================================
    // REVIEWS
    // =====================================================

    console.log("⭐ Creating manual reviews for delivered order items...");


    // =====================================================
    // GET DELIVERED ORDER ITEMS
    // =====================================================

    const deliveredOrderItems =
        await prisma.orderItem.findMany({

            where: {

                order: {

                    status: "DELIVERED"

                }

            },

            include: {

                order: {

                    select: {

                        userId: true,
                        restaurantId: true

                    }

                }

            },

            orderBy: {

                order: {

                    createdAt: "asc"

                }

            }

        });


    console.log(
        `📦 Delivered OrderItems available: ${deliveredOrderItems.length}`
    );


    // =====================================================
    // SAFETY CHECK
    // =====================================================

    if (deliveredOrderItems.length < 3000) {

        throw new Error(
            `Not enough delivered order items. ` +
            `At least 900 are required, but only ` +
            `${deliveredOrderItems.length} were found.`
        );

    }


    // =====================================================
    // CREATE REVIEWS
    // =====================================================

    let createdReviews = 0;

    for (const data of reviewData) {

        const orderItem =
            deliveredOrderItems[data.reviewIndex];


        if (!orderItem) {

            throw new Error(
                `Delivered OrderItem at index ${data.reviewIndex} not found.`
            );

        }


        // -------------------------------------------------
        // CHECK FOR EXISTING REVIEW
        // -------------------------------------------------

        const existingReview =
            await prisma.review.findUnique({

                where: {

                    orderItemId:
                        orderItem.id

                }

            });


        if (existingReview) {

            console.log(
                `⚠️ Review already exists for OrderItem ${orderItem.id}. Skipping.`
            );

            continue;

        }


        // -------------------------------------------------
        // CREATE REVIEW
        // -------------------------------------------------

        await prisma.review.create({

            data: {

                userId:
                    orderItem.order.userId,

                restaurantId:
                    orderItem.order.restaurantId,

                orderItemId:
                    orderItem.id,

                rating:
                    data.rating,

                ...(data.comment
                    ? {
                        comment:
                            data.comment
                    }
                    : {})

            }

        });


        createdReviews++;

        console.log(
            `⭐ Review ${createdReviews}/3000 created - Rating: ${data.rating}`
        );

    }


    console.log("");

    console.log(
        `✅ ${createdReviews} reviews created.`
    );




    console.log("");
    console.log("🎉 Seed completed successfully!");
    console.log("");

    console.log("Users:");
    console.log("  👑 1 System Admin");
    console.log("  👤 30 Customers");
    console.log("  🛵 1 Driver");
    console.log("  👨‍🍳 10 Restaurant Managers");
    console.log("  👥 Total Users: 42");

    console.log("");

    console.log("Restaurants: 10");
    console.log(`Categories: ${totalCategories}`);
    console.log(`Foods: ${totalFoods}`);

}


// =====================================================
// RUN SEED
// =====================================================

main()

    .catch((error) => {

        console.error(error);

        process.exit(1);

    })

    .finally(async () => {

        await prisma.$disconnect();

    });