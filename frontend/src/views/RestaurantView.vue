<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { addToCart as addFoodToCart } from "../services/cart.service.js";import FoodCard from "../components/FoodCard.vue";
import { getRestaurantById } from "../services/restaurant.service.js";

const route = useRoute();

const restaurant = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    console.log("Route ID:", route.params.id);

    const response = await getRestaurantById(route.params.id);

    console.log("API Response:", response);

    restaurant.value = response.data;

    console.log("Restaurant:", restaurant.value);

  } catch (err) {

    console.error(err);

    error.value = err.message;

  } finally {

    loading.value = false;

  }
});

async function addToCart(food) {

  try {

    await addFoodToCart(food.id);

    alert(`${food.name} added to cart.`);

  } catch (err) {

    alert(err.message);

  }

}
</script>

<template>
  <div class="container">

    <div v-if="loading">
      <h2>Loading...</h2>
    </div>

    <div v-else-if="error">
      <h2>{{ error }}</h2>
    </div>

    <div v-else-if="restaurant">

      <h1>{{ restaurant.name }}</h1>

      <p>{{ restaurant.description }}</p>

      <hr>

      <h2>Foods</h2>

      <div
        v-if="restaurant.foods && restaurant.foods.length"
        class="foods"
      >

        <FoodCard
          v-for="food in restaurant.foods"
          :key="food.id"
          :food="food"
          @add="addToCart"
        />

      </div>

      <div v-else>

        <p>No foods found.</p>

      </div>

    </div>

  </div>
</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
}

.foods {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 20px;
}
</style>