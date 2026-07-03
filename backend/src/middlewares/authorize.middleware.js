export default function authorize(...allowedRoles) {

    return (req, res, next) => {

        const userRoles = req.user.userRoles.map(

            userRole => userRole.role.name

        );

        const hasPermission = allowedRoles.some(

            role => userRoles.includes(role)

        );

        if (!hasPermission) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }

        next();

    };

}