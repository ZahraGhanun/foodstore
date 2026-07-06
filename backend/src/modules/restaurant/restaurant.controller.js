import * as service from "./restaurant.service.js";

export async function getRestaurants(req, res, next) {
    try {
        const restaurants = await service.getRestaurants();

        return res.json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        next(error);
    }
}

export async function getRestaurantById(req, res, next) {

    try {

        const restaurant = await service.getRestaurantById(req.params.id);

        res.json({

            success: true,

            data: restaurant

        });

    } catch (error) {

        next(error);

    }

}