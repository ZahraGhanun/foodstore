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

export async function getMyCategories(req, res, next) {

    try {

        const categories = await service.getMyCategories(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: categories

        });

    }

    catch (error) {

        next(error);

    }

}


export async function createMyRestaurantCategory(req, res, next) {

    try {

        const category = await service.createMyRestaurantCategory(

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



export async function updateMyRestaurantCategory(req, res, next) {

    try {

        const category = await service.updateMyRestaurantCategory(

            req.user.id,

            req.params.categoryId,

            req.body

        );

        return res.status(200).json({

            success: true,

            message: "Category updated successfully.",

            data: category

        });

    }

    catch (error) {

        next(error);

    }

}

export async function deleteMyRestaurantCategory(req, res, next) {

    try {

        await service.deleteMyRestaurantCategory(

            req.user.id,

            req.params.categoryId

        );

        return res.status(200).json({

            success: true,

            message: "Category deleted successfully."

        });

    }

    catch (error) {

        next(error);

    }

}

