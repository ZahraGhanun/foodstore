<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { addToCart as addFoodToCart } from "../services/cart.service.js";

import {
  getRestaurantById
} from "../services/restaurant.service.js";

import {
  getRestaurantRecommendations
} from "../services/recommendation.service.js";

import FoodCard from "../components/FoodCard.vue";


const route = useRoute();
const router = useRouter();


// =====================================================
// Restaurant
// =====================================================

const restaurant = ref(null);


// =====================================================
// Recommendations
// =====================================================

const recommendedFoods = ref([]);


// =====================================================
// State
// =====================================================

const loading = ref(true);
const recommendationsLoading = ref(true);

const error = ref("");
const recommendationsError = ref("");


// =====================================================
// Load Restaurant
// =====================================================

async function loadRestaurant() {

  try {

    console.log(
      "Route ID:",
      route.params.id
    );


    const response =
      await getRestaurantById(
        route.params.id
      );


    console.log(
      "API Response:",
      response
    );


    restaurant.value =
      response.data;


    console.log(
      "Restaurant:",
      restaurant.value
    );


  } catch (err) {

    console.error(err);

    error.value =
      err.message;

  } finally {

    loading.value = false;

  }

}


// =====================================================
// Load Restaurant Recommendations
// =====================================================

async function loadRecommendations() {

  recommendationsLoading.value = true;

  recommendationsError.value = "";


  try {

    const response =
      await getRestaurantRecommendations(
        route.params.id
      );


    console.log(
      "Restaurant Recommendations:",
      response
    );


    recommendedFoods.value =
      response || [];


  } catch (err) {

    console.error(
      "Failed to load restaurant recommendations:",
      err
    );


    recommendationsError.value =
      err.message ||
      "Failed to load recommendations.";


  } finally {

    recommendationsLoading.value = false;

  }

}


// =====================================================
// Add To Cart
// =====================================================

async function addToCart(food) {

  try {

    await addFoodToCart(
      food.id
    );


    alert(
      `${food.name} added to cart.`
    );


    router.push(
      "/recommendations"
    );


  } catch (err) {

    alert(
      err.message
    );

  }

}


// =====================================================
// Foods By Category
// =====================================================

function foodsForCategory(
  categoryId
) {

  return restaurant.value.foods.filter(
    food =>
      food.categoryId ===
      categoryId
  );

}


// =====================================================
// Mounted
// =====================================================

onMounted(() => {

  loadRestaurant();

  loadRecommendations();

});
</script>


<template>

  <div class="container">


    <!-- =================================================
         Loading Restaurant
         ================================================= -->

    <div v-if="loading">

      <h2>
        Loading...
      </h2>

    </div>


    <!-- =================================================
         Restaurant Error
         ================================================= -->

    <div v-else-if="error">

      <h2>
        {{ error }}
      </h2>

    </div>


    <!-- =================================================
         Restaurant
         ================================================= -->

    <div v-else-if="restaurant">


      <!-- =================================================
           Restaurant Header
           ================================================= -->

      <h1>
        {{ restaurant.name }}
      </h1>


      <p>
        {{ restaurant.description }}
      </p>


      <hr>


      <!-- =================================================
           Recommendations
           ================================================= -->

      <section class="recommendations-section">

        <h2 class="recommendations-title">
          ✨ Recommended For You
        </h2>


        <p class="recommendations-description">
          Foods selected based on your previous
          orders and what customers commonly buy.
        </p>


        <!-- Recommendation Loading -->

        <div
          v-if="recommendationsLoading"
          class="recommendations-state"
        >

          <p>
            Loading recommendations...
          </p>

        </div>


        <!-- Recommendation Error -->

        <div
          v-else-if="recommendationsError"
          class="recommendations-state error"
        >

          <p>
            {{ recommendationsError }}
          </p>

          <button
            @click="loadRecommendations"
            class="retry-button"
          >
            Try Again
          </button>

        </div>


        <!-- Recommendations -->

        <div
          v-else-if="recommendedFoods.length > 0"
          class="foods"
        >

          <FoodCard
            v-for="food in recommendedFoods"
            :key="food.id"
            :food="food"
            @add="addToCart"
          />

        </div>


        <!-- No Recommendations -->

        <div
          v-else
          class="recommendations-state"
        >

          <p>
            No recommendations available
            for this restaurant yet.
          </p>

        </div>

      </section>


      <!-- =================================================
           Full Menu
           ================================================= -->

      <h2>
        Foods
      </h2>


      <!-- Categories -->

      <div
        v-if="
          restaurant.categories &&
          restaurant.categories.length
        "
        class="categories"
      >


        <div
          v-for="category in restaurant.categories"
          :key="category.id"
          class="category"
        >


          <!-- Foods belonging to this category -->

          <div
            v-if="
              foodsForCategory(
                category.id
              ).length
            "
            class="category-content"
          >


            <h2 class="category-title">
              {{ category.name }}
            </h2>


            <p
              v-if="category.description"
              class="category-description"
            >
              {{ category.description }}
            </p>


            <div class="foods">


              <FoodCard
                v-for="
                  food in
                  foodsForCategory(
                    category.id
                  )
                "
                :key="food.id"
                :food="food"
                @add="addToCart"
              />


            </div>

          </div>

        </div>

      </div>


      <div v-else>

        <p>
          No categories found.
        </p>

      </div>

    </div>

  </div>

</template>


<style scoped>

.container {
  max-width: 1220px;
  margin: 40px auto;
  padding: 20px;
}


/* =====================================================
   Recommendations
   ===================================================== */

.recommendations-section {
  margin: 35px 0 55px;
}


.recommendations-title {
  margin-bottom: 8px;
  font-size: 28px;
}


.recommendations-description {
  margin-bottom: 25px;
  color: #666;
}


.recommendations-state {
  padding: 30px;
  text-align: center;
  color: #666;
  background: #f8f8f8;
  border-radius: 12px;
}


.recommendations-state.error {
  color: #c0392b;
}


.retry-button {
  margin-top: 12px;
  padding: 9px 18px;
  border: none;
  border-radius: 7px;
  background: #222;
  color: white;
  cursor: pointer;
}


/* =====================================================
   Categories
   ===================================================== */

.categories {
  margin-top: 30px;
}


.category {
  margin-bottom: 45px;
}


.category-title {
  margin-bottom: 8px;
  font-size: 28px;
}


.category-description {
  color: #666;
  margin-bottom: 20px;
}


/* =====================================================
   Food Grid
   ===================================================== */

.foods {
  display: grid;
  grid-template-columns: repeat(4, 280px);
  gap: 24px;
  margin-top: 20px;
}

</style>