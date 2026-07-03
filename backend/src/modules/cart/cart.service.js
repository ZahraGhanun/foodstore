import prisma from "../../config/prisma.js";
import { addToCartSchema } from "./cart.validation.js";

export async function getCart(userId) {

    let cart = await prisma.cart.findUnique({

        where: { userId },

        include: {
            cartItems: {
                include: {
                    food: true
                }
            },
            restaurant: true
        }

    });

    if (!cart) return null;

    return cart;
}
export async function addToCart(userId, data) {

    const validatedData = addToCartSchema.parse(data);

    const {
        foodId,
        quantity
    } = validatedData;

    let cart = await prisma.cart.findUnique({
        where: {
            userId
        }
    });

    const food = await prisma.food.findUnique({
        where: {
            id: foodId
        }
    });

    if (!food) {
        throw new Error("Food not found.");
    }

    // اگر Cart وجود ندارد بساز
    if (!cart) {

        cart = await prisma.cart.create({

            data: {
                userId,
                restaurantId: food.restaurantId
            }

        });

    }

    // جلوگیری از اضافه کردن غذای رستوران دیگر
    if (cart.restaurantId !== food.restaurantId) {

        throw new Error(
            "You cannot add food from another restaurant."
        );

    }

    const existingItem =
        await prisma.cartItem.findUnique({

            where: {

                cartId_foodId: {

                    cartId: cart.id,
                    foodId

                }

            }

        });

    if (existingItem) {

        return prisma.cartItem.update({

            where: {
                id: existingItem.id
            },

            data: {
                quantity: existingItem.quantity + quantity,
                unitPrice: food.price
            },

            include: {
                food: true
            }

        });

    }

    return prisma.cartItem.create({

        data: {

            cartId: cart.id,
            foodId,
            quantity,
            unitPrice: food.price

        },

        include: {
            food: true
        }

    });

}

export async function removeItem(userId, itemId) {

    const cart = await prisma.cart.findUnique({
        where: { userId }
    });

    if (!cart) throw new Error("Cart not found.");

    const item = await prisma.cartItem.findUnique({
        where: { id: itemId }
    });

    if (!item || item.cartId !== cart.id) {
        throw new Error("Item not found.");
    }

    return prisma.cartItem.delete({
        where: { id: itemId }
    });

}

export async function clearCart(userId) {

    const cart = await prisma.cart.findUnique({
        where: { userId }
    });

    if (!cart) return;

    await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
    });

    return true;
}