import * as service from "./review.service.js";
import prisma from "../../config/prisma.js";

export async function createReview(req, res, next) {
    try {

        const review = await service.createReview(
            req.user.id,
            req.params.orderItemId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            data: review
        });

    } catch (error) {
        next(error);
    }
}
export async function getMyReviews(req, res, next) {

    try {

        const reviews = await prisma.review.findMany({

            where: {
                userId: req.user.id
            },

            include: {

                orderItem: {

                    include: {

                        food: {

                            select: {
                                id: true,
                                name: true,
                                imageUrl: true
                            }

                        },

                        order: {

                            select: {
                                id: true,
                                createdAt: true,
                                status: true
                            }

                        }

                    }

                },

                restaurant: {

                    select: {
                        id: true,
                        name: true
                    }

                }

            },

            orderBy: {
                createdAt: "desc"
            }

        });

        return res.json({

            success: true,

            data: reviews

        });

    }

    catch (error) {

        next(error);

    }

}