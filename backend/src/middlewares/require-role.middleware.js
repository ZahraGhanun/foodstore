export default function requireRole(...roles) {

    return (req, res, next) => {

        const userRoles = req.user.userRoles.map(

            userRole => userRole.role.name

        );

        const hasRole = roles.some(

            role => userRoles.includes(role)

        );

        if (!hasRole) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }

        next();

    };

}