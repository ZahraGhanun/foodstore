<script setup>
import { ref, onMounted } from "vue";

import { getRecommendations } from "../services/recommendation.service.js";
import { addToCart } from "../services/cart.service.js";

import FoodCard from "../components/FoodCard.vue";

const recommendedForYou = ref([]);
const othersAlsoBought = ref([]);

const loading = ref(true);
const error = ref("");


async function handleAddToCart(food) {

    try {

        await addToCart(food.id, 1);

        alert(`${food.name} added to cart.`);

    } catch (err) {

        console.error(
            "Failed to add food to cart:",
            err
        );

        alert(
            err.message ||
            "Failed to add food to cart."
        );

    }

}


async function loadRecommendations() {

    loading.value = true;
    error.value = "";

    try {

        const response =
            await getRecommendations();

        recommendedForYou.value =
            response.recommendedForYou || [];

        othersAlsoBought.value =
            response.othersAlsoBought || [];

    } catch (err) {

        console.error(
            "Failed to load recommendations:",
            err
        );

        error.value =
            err.message ||
            "Failed to load recommendations.";

    } finally {

        loading.value = false;

    }

}


onMounted(() => {

    loadRecommendations();

});
</script>


<template>

    <div class="recommendation-page">

        <!-- Page Header -->

        <header class="page-header">

            <h1>Recommendations</h1>

            <p>
                Discover foods selected based on your
                orders and what customers commonly
                buy together.
            </p>

        </header>


        <!-- Loading -->

        <div
            v-if="loading"
            class="state-message"
        >

            <div class="loader"></div>

            <p>
                Loading recommendations...
            </p>

        </div>


        <!-- Error -->

        <div
            v-else-if="error"
            class="state-message error-message"
        >

            <p>
                {{ error }}
            </p>

            <button
                class="retry-button"
                @click="loadRecommendations"
            >
                Try Again
            </button>

        </div>


        <!-- Recommendations -->

        <template v-else>

            <!-- Recommended For You -->

            <section
                v-if="recommendedForYou.length > 0"
                class="recommendation-section"
            >

                <div class="section-header">

                    <div>

                        <h2>
                            Recommended For You
                        </h2>

                        <p>
                            Foods selected based on
                            your previous orders.
                        </p>

                    </div>

                </div>


                <div class="foods">

                    <FoodCard
                        v-for="food in recommendedForYou"
                        :key="food.id"
                        :food="food"
                        @add="handleAddToCart"
                    />

                </div>

            </section>


            <!-- Others Also Bought -->

            <section
                v-if="othersAlsoBought.length > 0"
                class="recommendation-section"
            >

                <div class="section-header">

                    <div>

                        <h2>
                            Others Also Bought
                        </h2>

                        <p>
                            Foods that customers often
                            order together.
                        </p>

                    </div>

                </div>


                <div class="foods">

                    <FoodCard
                        v-for="food in othersAlsoBought"
                        :key="food.id"
                        :food="food"
                        @add="handleAddToCart"
                    />

                </div>

            </section>


            <!-- Empty State -->

            <div
                v-if="
                    recommendedForYou.length === 0 &&
                    othersAlsoBought.length === 0
                "
                class="state-message"
            >

                <h2>
                    No recommendations yet
                </h2>

                <p>
                    Place a few orders and we'll have
                    some recommendations for you.
                </p>

            </div>

        </template>

    </div>

</template>


<style scoped>

.recommendation-page {

    max-width: 1200px;

    margin: 0 auto;

    padding: 40px 30px 60px;

}


/* -----------------------------
   Page Header
----------------------------- */

.page-header {

    margin-bottom: 40px;

}

.page-header h1 {

    margin: 0 0 10px;

    font-size: 32px;

    font-weight: 700;

}

.page-header p {

    margin: 0;

    max-width: 700px;

    color: #666;

    line-height: 1.7;

}


/* -----------------------------
   Sections
----------------------------- */

.recommendation-section {

    margin-bottom: 50px;

}

.section-header {

    margin-bottom: 22px;

}

.section-header h2 {

    margin: 0 0 7px;

    font-size: 23px;

    font-weight: 650;

}

.section-header p {

    margin: 0;

    color: #777;

    line-height: 1.6;

}


/* -----------------------------
   Food Cards
----------------------------- */

.foods {

    display: grid;

    grid-template-columns:
        repeat(
            auto-fill,
            minmax(220px, 1fr)
        );

    gap: 24px;

}


/* -----------------------------
   Loading / Empty / Error
----------------------------- */

.state-message {

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    min-height: 250px;

    padding: 30px;

    text-align: center;

    color: #666;

}

.state-message h2 {

    margin-bottom: 8px;

    color: #333;

}

.state-message p {

    margin: 0;

    line-height: 1.6;

}

.error-message {

    color: #c0392b;

}


/* -----------------------------
   Loader
----------------------------- */

.loader {

    width: 38px;

    height: 38px;

    margin-bottom: 15px;

    border: 4px solid #eee;

    border-top-color: #333;

    border-radius: 50%;

    animation: spin 0.8s linear infinite;

}

@keyframes spin {

    to {

        transform: rotate(360deg);

    }

}


/* -----------------------------
   Retry Button
----------------------------- */

.retry-button {

    margin-top: 18px;

    padding: 10px 20px;

    border: none;

    border-radius: 8px;

    background: #222;

    color: white;

    font-size: 14px;

    cursor: pointer;

    transition:
        opacity 0.2s ease,
        transform 0.2s ease;

}

.retry-button:hover {

    opacity: 0.85;

    transform: translateY(-1px);

}


/* -----------------------------
   Responsive
----------------------------- */

@media (max-width: 600px) {

    .recommendation-page {

        padding: 25px 16px 40px;

    }

    .page-header h1 {

        font-size: 27px;

    }

    .section-header h2 {

        font-size: 21px;

    }

    .foods {

        grid-template-columns:
            repeat(
                auto-fill,
                minmax(160px, 1fr)
            );

        gap: 16px;

    }

}

</style>
