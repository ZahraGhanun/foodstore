import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

    if (
        !process.env.SYSTEM_ADMIN_PHONE ||
        !process.env.SYSTEM_ADMIN_PASSWORD ||
        !process.env.SYSTEM_ADMIN_EMAIL
    ) {

        throw new Error(
            "System admin environment variables are missing."
        );

    }

    console.log("🌱 Seeding database...");

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

    const adminPhone = process.env.SYSTEM_ADMIN_PHONE;

    const existingAdmin = await prisma.user.findUnique({

        where: {

            phone: adminPhone

        }

    });

    if (!existingAdmin) {

        const hashedPassword = await bcrypt.hash(

            process.env.SYSTEM_ADMIN_PASSWORD,

            10

        );

        const systemAdminRole = await prisma.role.findUnique({

            where: {

                name: "SystemAdmin"

            }

        });

        if (!systemAdminRole) {

            throw new Error("SystemAdmin role not found.");

        }

        await prisma.user.create({

            data: {

                firstName: "System",

                lastName: "Administrator",

                phone: adminPhone,

                email: process.env.SYSTEM_ADMIN_EMAIL,

                passwordHash: hashedPassword,

                userRoles: {

                    create: {

                        roleId: systemAdminRole.id

                    }

                }

            }

        });

        console.log("✅ SystemAdmin created.");

    }
    else {

        console.log("ℹ️ SystemAdmin already exists.");

    }

}

main()
    .catch((e) => {

        console.error(e);
        process.exit(1);

    })
    .finally(async () => {

        await prisma.$disconnect();

    });