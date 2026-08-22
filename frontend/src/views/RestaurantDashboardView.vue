<script setup>

import { ref, onMounted } from "vue";

import {
    getDashboard
} from "../services/restaurant-dashboard.service.js";

import RestaurantCategoriesView
    from "./RestaurantCategoriesView.vue";

import RestaurantFoodsView
    from "./RestaurantFoodsView.vue";

import RestaurantOrdersView
    from "./RestaurantOrdersView.vue";


const dashboard = ref(null);

const loading = ref(true);

const error = ref("");

const activeTab = ref("dashboard");


onMounted(loadDashboard);


async function loadDashboard() {

    loading.value = true;

    error.value = "";

    try {

        const response =
            await getDashboard();

        dashboard.value =
            response.data;

    }

    catch (err) {

        error.value =
            err.message;

    }

    finally {

        loading.value = false;

    }

}

</script>


<template>

<div class="container">

    <!-- ========================= -->
    <!-- SIDEBAR -->
    <!-- ========================= -->

    <aside class="sidebar">

        <div class="sidebar-title">

            🍕 FoodStore

        </div>


        <div
            v-if="dashboard"
            class="restaurant-name"
        >

            {{ dashboard.restaurant.name }}

        </div>


        <button
            :class="{
                active: activeTab === 'dashboard'
            }"
            @click="activeTab = 'dashboard'"
        >

            🏠 Dashboard

        </button>


        <button
            :class="{
                active: activeTab === 'categories'
            }"
            @click="activeTab = 'categories'"
        >

            📂 Categories

        </button>


        <button
            :class="{
                active: activeTab === 'foods'
            }"
            @click="activeTab = 'foods'"
        >

            🍔 Foods

        </button>


        <button
            :class="{
                active: activeTab === 'orders'
            }"
            @click="activeTab = 'orders'"
        >

            📦 Orders

        </button>


    </aside>



    <!-- ========================= -->
    <!-- CONTENT -->
    <!-- ========================= -->

    <main class="content">


        <!-- ========================= -->
        <!-- LOADING -->
        <!-- ========================= -->

        <div v-if="loading">

            Loading...

        </div>


        <!-- ========================= -->
        <!-- ERROR -->
        <!-- ========================= -->

        <div
            v-else-if="error"
            class="error"
        >

            {{ error }}

        </div>


        <!-- ========================= -->
        <!-- DASHBOARD -->
        <!-- ========================= -->

        <div
            v-else-if="activeTab === 'dashboard'"
            class="dashboard"
        >

            <h1>

                🍕 Restaurant Dashboard

            </h1>


            <!-- Restaurant Information -->

            <div class="restaurant-card">

                <h2>

                    {{ dashboard.restaurant.name }}

                </h2>

                <p>

                    📍
                    {{ dashboard.restaurant.address }}

                </p>

                <p>

                    📞
                    {{ dashboard.restaurant.phone }}

                </p>

            </div>


            <!-- Quick Actions -->

            <div class="actions">


                <button
                    class="action-btn"
                    @click="activeTab = 'categories'"
                >

                    <span class="icon">

                        📂

                    </span>

                    <div>

                        <h3>

                            Manage Categories

                        </h3>

                        <p>

                            Create and organize food categories

                        </p>

                    </div>

                </button>



                <button
                    class="action-btn"
                    @click="activeTab = 'foods'"
                >

                    <span class="icon">

                        🍔

                    </span>

                    <div>

                        <h3>

                            Manage Foods

                        </h3>

                        <p>

                            Add, edit and remove foods

                        </p>

                    </div>

                </button>



                <button
                    class="action-btn"
                    @click="activeTab = 'orders'"
                >

                    <span class="icon">

                        📦

                    </span>

                    <div>

                        <h3>

                            Manage Orders

                        </h3>

                        <p>

                            View and update customer orders

                        </p>

                    </div>

                </button>


            </div>



            <!-- Statistics -->

            <div class="stats">


                <div class="stat-card">

                    <div class="emoji">

                        🍔

                    </div>

                    <h3>

                        Foods

                    </h3>

                    <p>

                        {{ dashboard.foodsCount }}

                    </p>

                </div>



                <div class="stat-card">

                    <div class="emoji">

                        📦

                    </div>

                    <h3>

                        Orders

                    </h3>

                    <p>

                        {{ dashboard.ordersCount }}

                    </p>

                </div>



                <div class="stat-card">

                    <div class="emoji">

                        ⭐

                    </div>

                    <h3>

                        Rating

                    </h3>

                    <p>

                        {{ dashboard.restaurant.avgRating }}

                    </p>

                </div>



                <div class="stat-card">

                    <div class="emoji">

                        🚚

                    </div>

                    <h3>

                        Delivery Fee

                    </h3>

                    <p>

                        {{
                            Number(
                                dashboard.restaurant.deliveryFee
                            ).toLocaleString()
                        }}

                        تومان

                    </p>

                </div>


            </div>



            <!-- Popular Foods -->

            <div class="popular">

                <h2>

                    🔥 Popular Foods

                </h2>


                <div
                    v-if="
                        dashboard.popularFoods.length === 0
                    "
                    class="empty"
                >

                    No popular foods yet.

                </div>


                <div
                    v-else
                    class="food-list"
                >

                    <div
                        v-for="
                            food in dashboard.popularFoods
                        "
                        :key="food.id"
                        class="food"
                    >

                        <span>

                            🍕
                            {{ food.name }}

                        </span>


                        <strong>

                            {{
                                Number(
                                    food.price
                                ).toLocaleString()
                            }}

                            تومان

                        </strong>

                    </div>

                </div>

            </div>


        </div>



        <!-- ========================= -->
        <!-- CATEGORIES -->
        <!-- ========================= -->

        <div
            v-else-if="activeTab === 'categories'"
            class="section"
        >

            <RestaurantCategoriesView />

        </div>



        <!-- ========================= -->
        <!-- FOODS -->
        <!-- ========================= -->

        <div
            v-else-if="activeTab === 'foods'"
            class="section"
        >

            <RestaurantFoodsView />

        </div>



        <!-- ========================= -->
        <!-- ORDERS -->
        <!-- ========================= -->

        <div
            v-else-if="activeTab === 'orders'"
            class="section"
        >

            <RestaurantOrdersView />

        </div>


    </main>

</div>

</template>


<style scoped>

.container{

    max-width:1200px;

    margin:40px auto;

    display:flex;

    gap:30px;

    padding:0 20px;

}


/* ========================= */
/* SIDEBAR */
/* ========================= */

.sidebar{

    width:250px;

    min-width:250px;

    background:white;

    border-radius:14px;

    box-shadow:
        0 2px 10px rgba(0,0,0,.08);

    padding:20px;

    display:flex;

    flex-direction:column;

    gap:12px;

    height:fit-content;

}


.sidebar-title{

    font-size:24px;

    font-weight:bold;

    color:#42b883;

    padding:5px 10px 15px;

    border-bottom:
        1px solid #eee;

}


.restaurant-name{

    font-size:14px;

    color:#666;

    padding:
        5px 10px 15px;

    border-bottom:
        1px solid #eee;

}


.sidebar button{

    border:none;

    padding:14px;

    border-radius:10px;

    cursor:pointer;

    background:#f5f5f5;

    text-align:left;

    font-size:15px;

    font-weight:600;

    color:#333;

    transition:.2s;

}


.sidebar button:hover{

    background:#ececec;

}


.sidebar button.active{

    background:#42b883;

    color:white;

}



/* ========================= */
/* CONTENT */
/* ========================= */

.content{

    flex:1;

    min-width:0;

}


.dashboard{

    display:flex;

    flex-direction:column;

    gap:25px;

}


.dashboard > h1{

    margin:0;

}


/* ========================= */
/* RESTAURANT CARD */
/* ========================= */

.restaurant-card{

    background:white;

    border-radius:16px;

    padding:28px;

    box-shadow:
        0 2px 10px rgba(0,0,0,.08);

}


.restaurant-card h2{

    margin-bottom:12px;

    color:#42b883;

}


.restaurant-card p{

    margin:8px 0;

    color:#555;

}



/* ========================= */
/* ACTIONS */
/* ========================= */

.actions{

    display:grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(250px,1fr)
        );

    gap:20px;

}


.action-btn{

    display:flex;

    align-items:center;

    gap:18px;

    padding:22px;

    border:none;

    border-radius:14px;

    background:white;

    text-align:left;

    color:#333;

    cursor:pointer;

    box-shadow:
        0 2px 10px rgba(0,0,0,.08);

    transition:.25s;

}


.action-btn:hover{

    transform:
        translateY(-5px);

    box-shadow:
        0 10px 24px rgba(0,0,0,.12);

}


.icon{

    font-size:42px;

}


.action-btn h3{

    margin:0;

    color:#42b883;

    font-size:18px;

}


.action-btn p{

    margin-top:6px;

    color:#666;

    font-size:14px;

}



/* ========================= */
/* STATS */
/* ========================= */

.stats{

    display:grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(200px,1fr)
        );

    gap:20px;

}


.stat-card{

    background:white;

    border-radius:16px;

    padding:26px;

    text-align:center;

    box-shadow:
        0 2px 10px rgba(0,0,0,.08);

    transition:.25s;

}


.stat-card:hover{

    transform:
        translateY(-4px);

}


.emoji{

    font-size:42px;

    margin-bottom:12px;

}


.stat-card h3{

    color:#666;

    margin-bottom:12px;

    font-size:16px;

}


.stat-card p{

    font-size:32px;

    font-weight:bold;

    color:#42b883;

}



/* ========================= */
/* POPULAR */
/* ========================= */

.popular{

    background:white;

    border-radius:16px;

    padding:28px;

    box-shadow:
        0 2px 10px rgba(0,0,0,.08);

}


.popular h2{

    margin-bottom:20px;

}


.food-list{

    display:flex;

    flex-direction:column;

    gap:14px;

}


.food{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:16px 18px;

    border-radius:10px;

    background:#f8f8f8;

    transition:.2s;

}


.food:hover{

    background:#efefef;

}


.food strong{

    color:#42b883;

}


.empty{

    color:#888;

    padding:20px 0;

    text-align:center;

}


.error{

    color:#e53935;

    background:#ffebee;

    padding:18px;

    border-radius:10px;

}


/* ========================= */
/* INNER SECTIONS */
/* ========================= */

.section{

    width:100%;

}



/* ========================= */
/* RESPONSIVE */
/* ========================= */

@media(max-width:850px){

    .container{

        flex-direction:column;

    }


    .sidebar{

        width:100%;

        min-width:0;

    }


    .sidebar button{

        text-align:center;

    }

}


@media(max-width:600px){

    .container{

        margin:20px auto;

        padding:0 12px;

    }


    .actions{

        grid-template-columns:1fr;

    }


    .stats{

        grid-template-columns:1fr 1fr;

    }

}

</style>