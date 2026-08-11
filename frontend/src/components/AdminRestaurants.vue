<script setup>

import { ref, onMounted } from "vue";

import {
    getAdminRestaurants,
    deactivateRestaurant as deactivateRestaurantApi
} from "../services/restaurant.service.js";


const restaurants = ref([]);

const loading = ref(false);

const error = ref("");


async function loadRestaurants() {

    loading.value = true;

    error.value = "";

    try {

        const response =
            await getAdminRestaurants();

        restaurants.value =
            response.data;

    }

    catch (err) {

        error.value =
            err.message ||
            "Failed to load restaurants.";

    }

    finally {

        loading.value = false;

    }

}


async function deactivateRestaurant(restaurant) {

    const confirmed = confirm(
        `Deactivate "${restaurant.name}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await deactivateRestaurantApi(
            restaurant.id
        );

        alert(
            "Restaurant deactivated successfully."
        );

        await loadRestaurants();

    }

    catch (err) {

        alert(
            err.message ||
            "Failed to deactivate restaurant."
        );

    }

}


onMounted(loadRestaurants);

</script>


<template>

<div>

    <div class="header">

        <div>

            <h1>
                🏬 Restaurants
            </h1>

            <p>
                Manage registered restaurants.
            </p>

        </div>


        <button
            class="refresh-btn"
            @click="loadRestaurants"
        >
            🔄 Refresh
        </button>

    </div>


    <div
        v-if="loading"
        class="placeholder"
    >
        Loading restaurants...
    </div>


    <div
        v-else-if="error"
        class="error-box"
    >
        ❌ {{ error }}
    </div>


    <div
        v-else-if="restaurants.length === 0"
        class="placeholder"
    >

        <h2>
            🏬 No Restaurants
        </h2>

        <p>
            There are currently no registered restaurants.
        </p>

    </div>


    <div
        v-else
        class="requests"
    >

        <div
            v-for="restaurant in restaurants"
            :key="restaurant.id"
            class="request-card"
        >

            <div class="request-info">

                <h2>
                    🏪 {{ restaurant.name }}
                </h2>


                <div class="info-row">

                    📞

                    <strong>
                        Phone:
                    </strong>

                    {{ restaurant.phone }}

                </div>


                <div class="info-row">

                    📍

                    <strong>
                        Address:
                    </strong>

                    {{ restaurant.address }}

                </div>


                <div class="info-row">

                    🟢

                    <strong>
                        Status:
                    </strong>

                    {{
                        restaurant.isActive
                            ? "Active"
                            : "Inactive"
                    }}

                </div>


                <div class="info-row">

                    ⭐

                    <strong>
                        Rating:
                    </strong>

                    {{ restaurant.avgRating }}

                </div>


                <div class="info-row">

                    📦

                    <strong>
                        Reviews:
                    </strong>

                    {{ restaurant.totalReviews }}

                </div>

            </div>


            <div class="actions">

                <button
                    v-if="restaurant.isActive"
                    class="deactivate-btn"
                    @click="
                        deactivateRestaurant(
                            restaurant
                        )
                    "
                >
                    ⛔ Deactivate Restaurant
                </button>


                <span
                    v-else
                    class="inactive-label"
                >
                    ⚪ Inactive
                </span>

            </div>

        </div>

    </div>

</div>

</template>


<style scoped>

.header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-bottom: 25px;

}

.header p {
    color: #666;
}

.refresh-btn {

    background: #42b883;

    color: white;

    border: none;

    padding: 11px 18px;

    border-radius: 9px;

    cursor: pointer;

    font-weight: bold;

}

.requests {

    display: flex;

    flex-direction: column;

    gap: 20px;

}

.request-card {

    background: white;

    border-radius: 16px;

    padding: 24px;

    display: flex;

    justify-content: space-between;

    gap: 30px;

    box-shadow:
        0 2px 12px
        rgba(0,0,0,.08);

}

.request-info {

    line-height: 1.9;

    flex: 1;

}

.request-info h2 {

    margin-top: 0;

    margin-bottom: 18px;

}

.info-row {
    margin-bottom: 6px;
}

.actions {

    display: flex;

    flex-direction: column;

    justify-content: center;

    gap: 10px;

}

.deactivate-btn {

    border: none;

    padding: 12px 18px;

    border-radius: 9px;

    cursor: pointer;

    font-weight: bold;

    background: #f1f1f1;

    color: #d33;

}

.inactive-label {

    color: #888;

    font-weight: bold;

}

.error-box {

    margin-top: 30px;

    background: #ffecec;

    color: #c62828;

    padding: 20px;

    border-radius: 12px;

}

.placeholder {

    margin-top: 30px;

    background: white;

    padding: 40px;

    border-radius: 16px;

    box-shadow:
        0 2px 12px
        rgba(0,0,0,.08);

}

@media(max-width:900px) {

    .request-card {
        flex-direction: column;
    }

}

</style>