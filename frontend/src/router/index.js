import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RestaurantView from "../views/RestaurantView.vue";
import RegisterView from "../views/RegisterView.vue";

const router = createRouter({

    history: createWebHistory(),

    routes: [

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
        }

    ]

});

export default router;