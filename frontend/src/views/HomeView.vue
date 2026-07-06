<script setup>
import { ref, onMounted } from "vue";

import RestaurantCard from "../components/RestaurantCard.vue";
import { getRestaurants } from "../services/restaurant.service.js";

const restaurants = ref([]);

onMounted(async () => {
  try {
    const response = await getRestaurants();
    restaurants.value = response.data;
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <section class="hero">
    <h1>Order Your Favorite Food Online</h1>

    <p>Fast delivery from the best restaurants in your city.</p>

    <button>Order Now</button>
  </section>

  <section class="restaurants">
    <RestaurantCard
  v-for="restaurant in restaurants"
  :key="restaurant.id"
  :id="restaurant.id"
  :name="restaurant.name"
  :description="restaurant.description"
  :image="restaurant.logoUrl"
/>
  </section>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 80px 20px;
}

.restaurants {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin: 60px 0;
}
</style>