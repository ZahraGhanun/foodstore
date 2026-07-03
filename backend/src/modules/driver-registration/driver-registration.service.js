import prisma from "../../config/prisma.js";

import {

    createDriverRequestSchema,

    reviewDriverRequestSchema

} from "./driver-registration.validation.js";

export async function createRequest(userId, data) {

    const validatedData =
        createDriverRequestSchema.parse(data);

    const existingPending =
        await prisma.driverRegistrationRequest.findFirst({

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

    return await prisma.driverRegistrationRequest.create({

        data: {

            applicantId: userId,

            ...validatedData

        }

    });

}

export async function reviewRequest(
    requestId,
    adminId,
    data
) {

    const validatedData =
        reviewDriverRequestSchema.parse(data);

    return await prisma.$transaction(async (tx) => {

        const request =
            await tx.driverRegistrationRequest.findUnique({

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
            await tx.driverRegistrationRequest.update({

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

            await tx.driver.create({

                data: {

                    userId: request.applicantId,

                    licensePlate: request.licensePlate

                }

            });

            const driverRole =
                await tx.role.findUnique({

                    where: {

                        name: "Driver"

                    }

                });

            if (!driverRole) {

                throw new Error(
                    "Driver role not found."
                );

            }

            const existingRole =
                await tx.userRole.findFirst({

                    where: {

                        userId: request.applicantId,

                        roleId: driverRole.id

                    }

                });

            if (!existingRole) {

                await tx.userRole.create({

                    data: {

                        userId: request.applicantId,

                        roleId: driverRole.id

                    }

                });

            }

        }

        return updatedRequest;

    });

}