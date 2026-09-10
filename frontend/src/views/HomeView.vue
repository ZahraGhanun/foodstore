<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { addToCart } from "../services/cart.service.js";

import RestaurantCard from "../components/RestaurantCard.vue";
import FoodCard from "../components/FoodCard.vue";

import { getRestaurants } from "../services/restaurant.service.js";

const router = useRouter();

const restaurants = ref([]);
const popularFoods = ref([]);

onMounted(async () => {
  try {
    const response = await getRestaurants();

    restaurants.value = response.data;
  } catch (error) {
    console.error("Failed to load restaurants:", error);
  }

  try {
    const response = await fetch("http://localhost:3000/api/popular");

    if (!response.ok) {
      throw new Error("Failed to load popular foods.");
    }

    const data = await response.json();

    popularFoods.value = data.data
      .slice(0, 6)
      .map(food => ({
        ...food,
        avgRating: food.averageRating
      }));

  } catch (error) {
    console.error("Failed to load popular foods:", error);
  }
});

async function handleAddToCart(food) {
  try {
    await addToCart(food.id, 1);

    alert(`${food.name} added to cart.`);

  } catch (error) {
    console.error("Failed to add food to cart:", error);

    alert(error.message);
  }
}

const goToDriverRegister = () => {
  router.push("/driver-register");
};

const goToRestaurantRegister = () => {
  router.push("/restaurant-register");
};
</script>


<template>

  <!-- Hero -->
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


  <!-- Popular Foods -->
  <section class="popular-foods-section">

    <div class="section-header">

      <h2>
        Popular Foods
      </h2>

      <p>
        The most popular foods based on delivered orders and ratings.
      </p>

    </div>


    <div
      v-if="popularFoods.length > 0"
      class="popular-foods"
    >

      <FoodCard
        v-for="food in popularFoods"
        :key="food.id"
        :food="food"
        @add="handleAddToCart"
      />

    </div>


    <p
      v-else
      class="no-foods"
    >
      No popular foods available yet.
    </p>

  </section>


  <!-- Restaurants -->
  <section class="restaurants-section">

    <h2>
      Restaurants
    </h2>

    <div class="restaurants">

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

    </div>

  </section>

</template>


<style scoped>

.hero {
  text-align: center;
  padding: 80px 20px;
}


.hero-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 25px;
}


.popular-foods-section {
  margin: 80px 0;
  padding: 0 20px;
}


.section-header {
  text-align: center;
  margin-bottom: 30px;
}


.section-header h2 {
  margin-bottom: 10px;
}


.section-header p {
  color: #666;
}


.popular-foods {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}


.no-foods {
  text-align: center;
  color: #777;
}


.restaurants-section {
  margin: 60px 0;
}


.restaurants-section h2 {
  text-align: center;
  margin-bottom: 30px;
}


.restaurants {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

</style>