import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../config/prisma.js";
import config from "../../config/env.js";

import {
    registerSchema,
    loginSchema
} from "./auth.validation.js";

export async function register(userData) {

    const validatedData = registerSchema.parse(userData);

    const existingUser = await prisma.user.findUnique({

        where: {
            phone: validatedData.phone
        }

    });

    if (existingUser) {

        throw new Error("Phone number already exists.");

    }

    const hashedPassword = await bcrypt.hash(

        validatedData.password,

        10

    );

    const customerRole = await prisma.role.findUnique({

        where: {
            name: "Customer"
        }

    });

    if (!customerRole) {

        throw new Error("Customer role not found.");

    }

    const user = await prisma.user.create({

        data: {

            firstName: validatedData.firstName,

            lastName: validatedData.lastName,

            phone: validatedData.phone,

            email: validatedData.email,

            passwordHash: hashedPassword,

            userRoles: {

                create: {

                    roleId: customerRole.id

                }

            }

        },

        include: {

            userRoles: {

                include: {

                    role: true

                }

            }

        }

    });

    return user;

}

export async function login(data) {

    const validatedData = loginSchema.parse(data);

    const user = await prisma.user.findUnique({

        where: {

            phone: validatedData.phone

        },

        include: {

            userRoles: {

                include: {

                    role: true

                }

            }

        }

    });

    if (!user) {

        throw new Error("Invalid phone or password.");

    }

    if (!user.isActive) {

        throw new Error("Your account is inactive.");

    }

    const passwordMatched = await bcrypt.compare(

        validatedData.password,

        user.passwordHash

    );

    if (!passwordMatched) {

        throw new Error("Invalid phone or password.");

    }

    const token = jwt.sign(

        {
            userId: user.id
        },

        config.jwtSecret,

        {
            expiresIn: "7d"
        }

    );

    return {

        token,

        user: {

            id: user.id,

            firstName: user.firstName,

            lastName: user.lastName,

            phone: user.phone,

            email: user.email,

            roles: user.userRoles.map(userRole => userRole.role.name)

        }

    };

}