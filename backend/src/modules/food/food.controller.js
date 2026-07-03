import * as service from "./food.service.js";

export async function createFood(req, res, next) {

    try {

        const food = await service.createFood(

            req.params.restaurantId,

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Food created successfully.",

            data: food

        });

    }

    catch (error) {

        next(error);

    }

}

export async function getFoods(req, res, next) {

    try {

        const foods = await service.getFoods(

            req.params.restaurantId

        );

        return res.status(200).json({

            success: true,

            data: foods

        });

    }

    catch (error) {

        next(error);

    }

}