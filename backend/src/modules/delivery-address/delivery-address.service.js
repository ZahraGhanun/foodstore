import prisma from "../../config/prisma.js";

import {
    createAddressSchema,
    updateAddressSchema
} from "./delivery-address.validation.js";

export async function getMyAddresses(userId) {

    return prisma.deliveryAddress.findMany({

        where: {
            userId
        },

        orderBy: [
            {
                isDefault: "desc"
            },
            {
                createdAt: "desc"
            }
        ]

    });

}

export async function createAddress(userId, data) {

    const validatedData =
        createAddressSchema.parse(data);

    if (validatedData.isDefault) {

        await prisma.deliveryAddress.updateMany({

            where: {
                userId
            },

            data: {
                isDefault: false
            }

        });

    }

    return prisma.deliveryAddress.create({

        data: {

            ...validatedData,

            userId

        }

    });

}

export async function updateAddress(userId, addressId, data) {

    const validatedData =
        updateAddressSchema.parse(data);

    const address =
        await prisma.deliveryAddress.findUnique({

            where: {
                id: addressId
            }

        });

    if (!address || address.userId !== userId) {

        throw new Error("Address not found.");

    }

    if (validatedData.isDefault) {

        await prisma.deliveryAddress.updateMany({

            where: {
                userId
            },

            data: {
                isDefault: false
            }

        });

    }

    return prisma.deliveryAddress.update({

        where: {
            id: addressId
        },

        data: validatedData

    });

}

export async function deleteAddress(userId, addressId) {

    const address =
        await prisma.deliveryAddress.findUnique({

            where: {
                id: addressId
            }

        });

    if (!address || address.userId !== userId) {

        throw new Error("Address not found.");

    }

    return prisma.deliveryAddress.delete({

        where: {
            id: addressId
        }

    });

}

export async function setDefaultAddress(userId, addressId) {

    const address =
        await prisma.deliveryAddress.findUnique({

            where: {
                id: addressId
            }

        });

    if (!address || address.userId !== userId) {

        throw new Error("Address not found.");

    }

    await prisma.deliveryAddress.updateMany({

        where: {
            userId
        },

        data: {
            isDefault: false
        }

    });

    return prisma.deliveryAddress.update({

        where: {
            id: addressId
        },

        data: {
            isDefault: true
        }

    });

}