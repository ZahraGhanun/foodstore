<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { addToCart as addFoodToCart } from "../services/cart.service.js";
import FoodCard from "../components/FoodCard.vue";
import { getRestaurantById } from "../services/restaurant.service.js";

const route = useRoute();
const router = useRouter();

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

    // بعد از اضافه شدن موفق غذا به سبد
    // رفتن به صفحه Recommendations
    router.push("/recommendations");

  } catch (err) {
    alert(err.message);
  }
}

function foodsForCategory(categoryId) {
  return restaurant.value.foods.filter(
    food => food.categoryId === categoryId
  );
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

      <!-- Categories -->
      <div
        v-if="restaurant.categories && restaurant.categories.length"
        class="categories"
      >

        <div
          v-for="category in restaurant.categories"
          :key="category.id"
          class="category"
        >

          <!-- Foods belonging to this category -->
          <div
            v-if="foodsForCategory(category.id).length"
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
                v-for="food in foodsForCategory(category.id)"
                :key="food.id"
                :food="food"
                @add="addToCart"
              />

            </div>

          </div>

        </div>

      </div>

      <div v-else>
        <p>No categories found.</p>
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

.foods {
  display: grid;
  grid-template-columns: repeat(4, 280px);
  gap: 24px;
  margin-top: 20px;
}

</style>