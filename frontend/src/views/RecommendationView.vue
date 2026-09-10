<script setup>
import { ref, onMounted } from "vue";

import { getRecommendations } from "../services/order.service.js";
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

        alert(err.message);

    }

}


onMounted(async () => {

    try {

        const response = await getRecommendations();

        recommendedForYou.value =
            response.data.recommendedForYou;

        othersAlsoBought.value =
            response.data.othersAlsoBought;

    } catch (err) {

        console.error(
            "Failed to load recommendations:",
            err
        );

        error.value = err.message;

    } finally {

        loading.value = false;

    }

});
</script>


<template>

    <div class="recommendation-page">

        <h1>Recommendations</h1>


        <p v-if="loading">
            Loading recommendations...
        </p>


        <p v-else-if="error">
            {{ error }}
        </p>


        <template v-else>

            <!-- Recommended For You -->

            <section
                v-if="recommendedForYou.length > 0"
                class="recommendation-section"
            >

                <h2>Recommended For You</h2>

                <p>
                    Foods you have ordered before.
                </p>


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

                <h2>Others Also Bought</h2>

                <p>
                    Other customers who bought similar foods also bought these.
                </p>


                <div class="foods">

                    <FoodCard
                        v-for="food in othersAlsoBought"
                        :key="food.id"
                        :food="food"
                        @add="handleAddToCart"
                    />

                </div>

            </section>


            <p
                v-if="
                    recommendedForYou.length === 0 &&
                    othersAlsoBought.length === 0
                "
            >
                No recommendations available yet.
            </p>

        </template>

    </div>

</template>


<style scoped>

.recommendation-page {
    padding: 30px;
}

.recommendation-section {
    margin-bottom: 40px;
}

.recommendation-section h2 {
    margin-bottom: 8px;
}

.recommendation-section p {
    color: #666;
    margin-bottom: 20px;
}

.foods {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

</style>