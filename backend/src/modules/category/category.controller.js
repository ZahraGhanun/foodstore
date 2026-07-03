import * as service from "./category.service.js";

export async function createCategory(req, res, next) {

    try {

        const category = await service.createCategory(

            req.params.restaurantId,

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Category created successfully.",

            data: category

        });

    }

    catch (error) {

        next(error);

    }

}

export async function getCategories(req, res, next) {

    try {

        const categories = await service.getCategories(

            req.params.restaurantId

        );

        return res.json({

            success: true,

            data: categories

        });

    }

    catch (error) {

        next(error);

    }

}