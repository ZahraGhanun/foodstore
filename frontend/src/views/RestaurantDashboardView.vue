<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { getDashboard } from "../services/restaurant-dashboard.service.js";

const dashboard = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(loadDashboard);

async function loadDashboard() {

    loading.value = true;
    error.value = "";

    try {

        const response = await getDashboard();

        dashboard.value = response.data;

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}
</script>

<template>

<div class="container">

    <h1>🍕 Restaurant Dashboard</h1>

    <div v-if="loading">

        Loading...

    </div>

    <div
        v-else-if="error"
        class="error"
    >

        {{ error }}

    </div>

    <div
        v-else
        class="dashboard"
    >

        <div class="restaurant-card">

            <h2>

                {{ dashboard.restaurant.name }}

            </h2>

            <p>

                📍 {{ dashboard.restaurant.address }}

            </p>

            <p>

                📞 {{ dashboard.restaurant.phone }}

            </p>

        </div>

        <div class="actions">

            <RouterLink
                class="action-btn"
                to="/restaurant-dashboard/categories"
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

            </RouterLink>

            <RouterLink
                class="action-btn"
                to="/restaurant-dashboard/foods"
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

            </RouterLink>

            <RouterLink
                class="action-btn"
                to="/restaurant-dashboard/orders"
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

            </RouterLink>

        </div>

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

                    {{ Number(dashboard.restaurant.deliveryFee).toLocaleString() }}

                    تومان

                </p>

            </div>

        </div>

        <div class="popular">

            <h2>

                🔥 Popular Foods

            </h2>

            <div
                v-if="dashboard.popularFoods.length===0"
                class="empty"
            >

                No popular foods yet.

            </div>

            <div
                v-else
                class="food-list"
            >

                <div
                    class="food"
                    v-for="food in dashboard.popularFoods"
                    :key="food.id"
                >

                    <span>

                        🍕 {{ food.name }}

                    </span>

                    <strong>

                        {{ Number(food.price).toLocaleString() }}

                        تومان

                    </strong>

                </div>

            </div>

        </div>

    </div>

</div>

</template>


<style scoped>

.container{

    max-width:1100px;
    margin:40px auto;

}

.dashboard{

    display:flex;
    flex-direction:column;
    gap:25px;

}

.restaurant-card{

    background:white;
    border-radius:16px;
    padding:28px;
    box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.restaurant-card h2{

    margin-bottom:12px;
    color:#42b883;

}

.restaurant-card p{

    margin:8px 0;
    color:#555;

}

.actions{

    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
    gap:20px;

}

.action-btn{

    display:flex;
    align-items:center;
    gap:18px;

    padding:22px;

    border-radius:14px;

    background:white;

    text-decoration:none;

    color:#333;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

    transition:.25s;

}

.action-btn:hover{

    transform:translateY(-5px);

    box-shadow:0 10px 24px rgba(0,0,0,.12);

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

.stats{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));

    gap:20px;

}

.stat-card{

    background:white;

    border-radius:16px;

    padding:26px;

    text-align:center;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

    transition:.25s;

}

.stat-card:hover{

    transform:translateY(-4px);

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

.popular{

    background:white;

    border-radius:16px;

    padding:28px;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

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

@media (max-width:768px){

    .container{

        margin:20px;

    }

    .actions{

        grid-template-columns:1fr;

    }

    .stats{

        grid-template-columns:1fr 1fr;

    }

}

@media (max-width:600px){

    .stats{

        grid-template-columns:1fr;

    }

    .food{

        flex-direction:column;

        align-items:flex-start;

        gap:8px;

    }

}

</style>