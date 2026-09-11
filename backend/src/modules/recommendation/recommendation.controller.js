import { getRecommendations } from "./recommendation.service.js";

export async function getRecommendationsController(req, res, next) {
    try {
        const userId = req.user.id;

        const recommendations =
            await getRecommendations(userId);

        return res.status(200).json(
            recommendations
        );

    } catch (error) {
        next(error);
    }
}