import express from "express";
import categoryRoutes from "./modules/category/category.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import restaurantRegistrationRoutes from "./modules/restaurant-registration/restaurant-registration.routes.js";
import driverRegistrationRoutes from "./modules/driver-registration/driver-registration.routes.js";
import foodRoutes
    from "./modules/food/food.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(
    "/api/restaurant-registration",
    restaurantRegistrationRoutes
);

app.use(
    "/api/driver-registration",
    driverRegistrationRoutes
);
app.use("/api", foodRoutes);
app.use("/api", categoryRoutes);
// همیشه Error Middleware آخر باشد
app.use(errorMiddleware);

export default app;


