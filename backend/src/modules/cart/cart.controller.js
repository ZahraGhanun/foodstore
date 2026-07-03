import * as service from "./cart.service.js";

export async function getCart(req, res, next) {

    try {

        const cart = await service.getCart(req.user.id);

        return res.json({

            success: true,
            data: cart

        });

    } catch (error) {
        next(error);
    }
}

export async function addToCart(req, res, next) {

    try {

        const item = await service.addToCart(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,
            message: "Item added to cart.",
            data: item

        });

    } catch (error) {
        next(error);
    }
}

export async function removeItem(req, res, next) {

    try {

        await service.removeItem(
            req.user.id,
            req.params.itemId
        );

        return res.json({

            success: true,
            message: "Item removed from cart."

        });

    } catch (error) {
        next(error);
    }
}

export async function clearCart(req, res, next) {

    try {

        await service.clearCart(req.user.id);

        return res.json({

            success: true,
            message: "Cart cleared."

        });

    } catch (error) {
        next(error);
    }
}