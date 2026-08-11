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

        throw new Error(
            `${roleName} role not found.`
        );

    }

    const existingUser = await prisma.user.findUnique({

        where: {
            phone
        }

    });

    if (existingUser) {

        console.log(
            `ℹ️ ${roleName} already exists.`
        );

        return;

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    await prisma.user.create({

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
        `✅ ${roleName} created.`
    );

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

        firstName: "Test",

        lastName: "Customer",

        phone: "09131111111",

        email: "customer@foodstore.com",

        password: "123456",

        roleName: "Customer"

    });


    // =========================
    // RESTAURANT MANAGER
    // =========================

    await createUser({

        firstName: "Test",

        lastName: "Restaurant",

        phone: "09132222222",

        email: "manager@foodstore.com",

        password: "123456",

        roleName: "RestaurantManager"

    });


    // =========================
    // DRIVER
    // =========================

    await createUser({

        firstName: "Test",

        lastName: "Driver",

        phone: "09133333333",

        email: "driver@foodstore.com",

        password: "123456",

        roleName: "Driver"

    });


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