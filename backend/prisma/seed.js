import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
        console.log(`ℹ️ ${roleName} already exists: ${phone}`);
        return existingUser;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    console.log(`✅ ${roleName} created: ${email}`);

    return user;
}

async function main() {
    console.log("🌱 Seeding database...");

    // =========================
    // ROLES
    // =========================

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

    console.log("✅ Roles seeded successfully.");

    // =========================
    // SYSTEM ADMIN
    // =========================

    await createUser({
        firstName: "System",
        lastName: "Administrator",
        phone: "09131313131",
        email: "admin@foodstore.com",
        password: "123456",
        roleName: "SystemAdmin"
    });

    // =========================
    // CUSTOMER
    // =========================

    await createUser({
        firstName: "Customer",
        lastName: "Test",
        phone: "09131111111",
        email: "customer@foodstore.com",
        password: "123456",
        roleName: "Customer"
    });

    // =========================
    // DRIVER
    // =========================

    await createUser({
        firstName: "Driver",
        lastName: "Test",
        phone: "09133333333",
        email: "driver@foodstore.com",
        password: "123456",
        roleName: "Driver"
    });

    // =========================
    // RESTAURANT MANAGERS
    // =========================

    const manager1 = await createUser({
        firstName: "Ali",
        lastName: "Ahmadi",
        phone: "09132222221",
        email: "manager1@foodstore.com",
        password: "123456",
        roleName: "RestaurantManager"
    });

    const manager2 = await createUser({
        firstName: "Reza",
        lastName: "Karimi",
        phone: "09132222222",
        email: "manager2@foodstore.com",
        password: "123456",
        roleName: "RestaurantManager"
    });

    const manager3 = await createUser({
        firstName: "Hassan",
        lastName: "Mohammadi",
        phone: "09132222223",
        email: "manager3@foodstore.com",
        password: "123456",
        roleName: "RestaurantManager"
    });

    // =========================
    // RESTAURANTS
    // =========================

    const restaurant1 = await prisma.restaurant.upsert({
        where: {
            slug: "pizza-house"
        },
        update: {},
        create: {
            name: "Pizza House",
            slug: "pizza-house",
            description: "Fresh and delicious pizzas",
            phone: "02111111111",
            address: "Tehran, Valiasr Street",
            minimumOrder: 150000,
            deliveryFee: 30000,
            managerId: manager1.id
        }
    });

    const restaurant2 = await prisma.restaurant.upsert({
        where: {
            slug: "burger-land"
        },
        update: {},
        create: {
            name: "Burger Land",
            slug: "burger-land",
            description: "Classic and special burgers",
            phone: "02122222222",
            address: "Tehran, Keshavarz Boulevard",
            minimumOrder: 120000,
            deliveryFee: 25000,
            managerId: manager2.id
        }
    });

    const restaurant3 = await prisma.restaurant.upsert({
        where: {
            slug: "iranian-taste"
        },
        update: {},
        create: {
            name: "Iranian Taste",
            slug: "iranian-taste",
            description: "Traditional Iranian cuisine",
            phone: "02133333333",
            address: "Tehran, Saadat Abad",
            minimumOrder: 200000,
            deliveryFee: 35000,
            managerId: manager3.id
        }
    });

    console.log("✅ Restaurants seeded successfully.");

    // =========================
    // CATEGORIES
    // =========================

    const category1 = await prisma.category.upsert({
        where: {
            restaurantId_name: {
                restaurantId: restaurant1.id,
                name: "Pizza"
            }
        },
        update: {},
        create: {
            name: "Pizza",
            description: "Different types of pizza",
            displayOrder: 1,
            restaurantId: restaurant1.id
        }
    });

    const category2 = await prisma.category.upsert({
        where: {
            restaurantId_name: {
                restaurantId: restaurant2.id,
                name: "Burgers"
            }
        },
        update: {},
        create: {
            name: "Burgers",
            description: "Different types of burgers",
            displayOrder: 1,
            restaurantId: restaurant2.id
        }
    });

    const category3 = await prisma.category.upsert({
        where: {
            restaurantId_name: {
                restaurantId: restaurant3.id,
                name: "Iranian Food"
            }
        },
        update: {},
        create: {
            name: "Iranian Food",
            description: "Traditional Iranian dishes",
            displayOrder: 1,
            restaurantId: restaurant3.id
        }
    });

    console.log("✅ Categories seeded successfully.");

    // =========================
    // FOODS
    // =========================

    await prisma.food.createMany({
        data: [
            {
                name: "Margherita Pizza",
                description: "Classic pizza with tomato sauce and cheese",
                price: 180000,
                restaurantId: restaurant1.id,
                categoryId: category1.id
            },
            {
                name: "Pepperoni Pizza",
                description: "Pizza with pepperoni and mozzarella cheese",
                price: 230000,
                restaurantId: restaurant1.id,
                categoryId: category1.id
            },
            {
                name: "Classic Burger",
                description: "Beef burger with lettuce, tomato and special sauce",
                price: 170000,
                restaurantId: restaurant2.id,
                categoryId: category2.id
            },
            {
                name: "Cheese Burger",
                description: "Beef burger with cheddar cheese",
                price: 200000,
                restaurantId: restaurant2.id,
                categoryId: category2.id
            },
            {
                name: "Ghormeh Sabzi",
                description: "Traditional Iranian herb stew with rice",
                price: 220000,
                restaurantId: restaurant3.id,
                categoryId: category3.id
            },
            {
                name: "Chelo Kebab",
                description: "Iranian kebab served with saffron rice",
                price: 280000,
                restaurantId: restaurant3.id,
                categoryId: category3.id
            }
        ]
    });

    console.log("✅ Foods seeded successfully.");

    console.log("🎉 Seed completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });