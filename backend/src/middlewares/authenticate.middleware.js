import jwt from "jsonwebtoken";

import prisma from "../config/prisma.js";
import config from "../config/env.js";

export default async function authenticate(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,
                message: "Authentication required."

            });

        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {

            return res.status(401).json({

                success: false,
                message: "Invalid authorization header."

            });

        }

        const payload = jwt.verify(

            token,

            config.jwtSecret

        );

        const user = await prisma.user.findUnique({

            where: {

                id: payload.userId

            },

            select: {

                id: true,

                firstName: true,

                lastName: true,

                phone: true,

                email: true,

                isActive: true,

                userRoles: {

                    select: {

                        role: {

                            select: {

                                id: true,

                                name: true

                            }

                        }

                    }

                }

            }

        });

        if (!user || !user.isActive) {

            return res.status(401).json({

                success: false,
                message: "Invalid token."

            });

        }

        req.user = user;

        next();

    }

    catch (error) {

        return res.status(401).json({

            success: false,
            message: "Invalid or expired token."

        });

    }

}