import prisma from "../../config/prisma.js";

import {
    createRestaurantRequestSchema,
    reviewRestaurantRequestSchema
} from "./restaurant-registration.validation.js";

export async function createRequest(userId, data) {

    const validatedData =
        createRestaurantRequestSchema.parse(data);

    const existingPending =
        await prisma.restaurantRegistrationRequest.findFirst({

            where: {

                applicantId: userId,

                status: "PENDING"

            }

        });

    if (existingPending) {

        throw new Error(
            "You already have a pending request."
        );

    }

    return await prisma.restaurantRegistrationRequest.create({

        data: {

            applicantId: userId,

            ...validatedData

        }

    });

}

export async function getPendingRequests() {

    return prisma.restaurantRegistrationRequest.findMany({

        where: {

            status: "PENDING"

        },

        orderBy: {

            createdAt: "asc"

        },

        include: {

            applicant: {

                select: {

                    id: true,

                    firstName: true,

                    lastName: true,

                    phone: true,

                    email: true

                }

            }

        }

    });

}

export async function reviewRequest(
    requestId,
    adminId,
    data
) {

    const validatedData =
        reviewRestaurantRequestSchema.parse(data);

    return await prisma.$transaction(async (tx) => {

        const request =
            await tx.restaurantRegistrationRequest.findUnique({

                where: {

                    id: requestId

                }

            });

        if (!request) {

            throw new Error("Request not found.");

        }

        if (request.status !== "PENDING") {

            throw new Error("Request already reviewed.");

        }

        const updatedRequest =
            await tx.restaurantRegistrationRequest.update({

                where: {

                    id: requestId

                },

                data: {

                    status: validatedData.status,

                    adminMessage: validatedData.adminMessage,

                    reviewedById: adminId,

                    reviewedAt: new Date()

                }

            });

        if (validatedData.status === "APPROVED") {

            console.log("========== APPROVING RESTAURANT ==========");
            console.log(request);

            const slug = request.restaurantName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-");

            console.log("Creating restaurant...");

            const restaurant =
                await tx.restaurant.create({

                    data: {

                        name: request.restaurantName,

                        slug,

                        phone: request.phone,

                        address: request.address,

                        description: request.description,

                        managerId: request.applicantId

                    }

                });

            console.log("Restaurant created:");
            console.log(restaurant);

            const managerRole =
                await tx.role.findUnique({

                    where: {

                        name: "RestaurantManager"

                    }

                });

            if (!managerRole) {

                throw new Error("RestaurantManager role not found.");

            }

            const existingRole =
                await tx.userRole.findFirst({

                    where: {

                        userId: request.applicantId,

                        roleId: managerRole.id

                    }

                });

            if (!existingRole) {

                await tx.userRole.create({

                    data: {

                        userId: request.applicantId,

                        roleId: managerRole.id

                    }

                });

                console.log("RestaurantManager role assigned.");

            } else {

                console.log("User already has RestaurantManager role.");

            }

            console.log("========== DONE ==========");

        }

        return updatedRequest;

    });

}