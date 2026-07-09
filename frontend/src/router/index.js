import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RestaurantView from "../views/RestaurantView.vue";
import RegisterView from "../views/RegisterView.vue";
import CartView from "../views/CartView.vue";
import ProfileView from "../views/ProfileView.vue";
import CheckoutView from "../views/CheckoutView.vue";
import OrderDetailsView from "../views/OrderDetailsView.vue";
import RestaurantDashboardView
    from "../views/RestaurantDashboardView.vue";
import RestaurantFoodsView
    from "../views/RestaurantFoodsView.vue";
import RestaurantCategoriesView
    from "../views/RestaurantCategoriesView.vue";
import RestaurantOrdersView from "../views/RestaurantOrdersView.vue";


const router = createRouter({

    history: createWebHistory(),

    routes: [
        {
            path: "/restaurant-dashboard/orders",
            component: RestaurantOrdersView
        },

        {
            path: "/restaurant-dashboard/categories",
            component: RestaurantCategoriesView
        },

        {
            path: "/restaurant-dashboard/foods",
            component: RestaurantFoodsView
        },

        {
            path: "/restaurant-dashboard",
            component: RestaurantDashboardView
        },

        {
            path: "/orders/:id",
            component: OrderDetailsView
        },

        {
            path: "/checkout",
            component: CheckoutView
        },

        {
            path: "/",
            component: HomeView
        },

        {
            path: "/login",
            component: LoginView
        },


        {

            path: "/register",

            component: RegisterView

        },

        {
            path: "/restaurants/:id",
            component: RestaurantView
        },

        {
            path: "/cart",
            component: CartView
        },
        {
            path: "/profile"
            , component: ProfileView
        }


    ]

});

export default router;