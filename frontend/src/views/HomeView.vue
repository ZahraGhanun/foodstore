<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import RestaurantCard from "../components/RestaurantCard.vue";
import { getRestaurants } from "../services/restaurant.service.js";

const router = useRouter();

const restaurants = ref([]);

onMounted(async () => {
  try {
    const response = await getRestaurants();

    restaurants.value = response.data;

  } catch (error) {
    console.error(error);
  }
});

const goToDriverRegister = () => {
  router.push("/driver-register");
};

const goToRestaurantRegister = () => {
  router.push("/restaurant-register");
};
</script>

<template>

  <section class="hero">

    <h1>
      Order Your Favorite Food Online
    </h1>

    <p>
      Fast delivery from the best restaurants in your city.
    </p>

    <div class="hero-actions">

      <button @click="router.push('/restaurants')">
        Order Now
      </button>

      <button @click="goToDriverRegister">
        Register as Driver
      </button>

      <button @click="goToRestaurantRegister">
        Register Your Restaurant
      </button>

    </div>

  </section>


  <section class="restaurants">

    <RestaurantCard
      v-for="restaurant in restaurants"
      :key="restaurant.id"

      :id="restaurant.id"
      :name="restaurant.name"
      :description="restaurant.description"
      :image="restaurant.logoUrl"

      :avgRating="restaurant.avgRating"
      :totalReviews="restaurant.totalReviews"
      :orderCount="restaurant.orderCount"
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


.hero-actions {

  display: flex;

  justify-content: center;

  gap: 15px;

  flex-wrap: wrap;

  margin-top: 25px;

}

</style>