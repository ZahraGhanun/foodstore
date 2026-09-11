import {
    getRecommendations,
    getRestaurantRecommendations
} from "./recommendation.service.js";


// =====================================================
// General Recommendations
// =====================================================

export async function getRecommendationsController(
    req,
    res,
    next
) {
    try {

        const userId =
            req.user.id;


        const recommendations =
            await getRecommendations(
                userId
            );


        return res.status(200).json(
            recommendations
        );

    } catch (error) {

        next(error);

    }
}


// =====================================================
// Restaurant Recommendations
// =====================================================

export async function getRestaurantRecommendationsController(
    req,
    res,
    next
) {
    try {

        const userId =
            req.user.id;


        const restaurantId =
            req.params.restaurantId;


        const recommendations =
            await getRestaurantRecommendations(
                userId,
                restaurantId
            );


        return res.status(200).json(
            recommendations
        );

    } catch (error) {

        next(error);

    }
}