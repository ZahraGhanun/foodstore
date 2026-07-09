import express from "express";
import categoryRoutes from "./modules/category/category.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import restaurantRegistrationRoutes from "./modules/restaurant-registration/restaurant-registration.routes.js";
import driverRegistrationRoutes from "./modules/driver-registration/driver-registration.routes.js";
import foodRoutes
    from "./modules/food/food.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import restaurantRoutes from "./modules/restaurant/restaurant.routes.js";
import deliveryAddressRoutes
    from "./modules/delivery-address/delivery-address.routes.js";
import restaurantDashboardRoutes
    from "./modules/restaurant-dashboard/restaurant-dashboard.routes.js";

import cors from "cors";

const app = express();
app.use(cors());
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

app.use(
    "/api/restaurant-dashboard",
    restaurantDashboardRoutes
);
app.use("/api/orders", orderRoutes);
app.use("/api", cartRoutes);
app.use("/api", foodRoutes);
app.use("/api", categoryRoutes);
app.use("/api", restaurantRoutes);
app.use("/api/addresses", deliveryAddressRoutes);


// همیشه Error Middleware آخر باشد
app.use(errorMiddleware);

export default app;


