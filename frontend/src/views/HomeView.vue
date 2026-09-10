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

    router.push("/recommendations");

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

    <div class="hero-content">

      <div class="hero-text">

        <span class="hero-badge">
          🍽️ FoodStore
        </span>

        <h1>
          Delicious food,
          <span>just a click away.</span>
        </h1>

        <p>
          Discover popular dishes and order from the best
          restaurants in your city.
        </p>

        <div class="hero-actions">

          <button
            class="primary-button"
            @click="router.push('/restaurants')"
          >
            Explore Restaurants
          </button>

          <button
            class="secondary-button"
            @click="router.push('/restaurants')"
          >
            Browse Foods
          </button>

        </div>

        <div class="partner-links">

          <button @click="goToDriverRegister">
            Become a Driver
          </button>

          <span>•</span>

          <button @click="goToRestaurantRegister">
            Register Your Restaurant
          </button>

        </div>

      </div>

      <div class="hero-visual">

        <div class="food-circle">
          🍔
        </div>

        <div class="floating-card card-one">
          ⭐ 4.8
        </div>

        <div class="floating-card card-two">
          🚀 Fast Delivery
        </div>

      </div>

    </div>

  </section>


  <!-- Popular Foods -->
  <section class="popular-foods-section">

    <div class="section-header">

      <div>

        <span class="section-label">
          MOST ORDERED
        </span>

        <h2>
          Popular Foods
        </h2>

        <p>
          The most popular foods based on delivered orders and ratings.
        </p>

      </div>

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

    <div class="section-header">

      <div>

        <span class="section-label">
          DISCOVER
        </span>

        <h2>
          Our Restaurants
        </h2>

        <p>
          Explore restaurants and discover your next favorite meal.
        </p>

      </div>


    </div>


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
  background:
    linear-gradient(
      135deg,
      #f4fbf7 0%,
      #ffffff 55%,
      #f8faf9 100%
    );

  padding: 55px 30px 60px;

  border-bottom: 1px solid #edf1ee;
}


.hero-content {
  max-width: 1100px;
  margin: 0 auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 50px;
}


.hero-text {
  max-width: 650px;
}


.hero-badge {
  display: inline-block;

  padding: 7px 14px;

  border-radius: 20px;

  background: #e6f6ed;

  color: #2f9e68;

  font-size: 13px;
  font-weight: 600;

  margin-bottom: 18px;
}


.hero h1 {
  margin: 0;

  font-size: 48px;

  line-height: 1.15;

  color: #202522;
}


.hero h1 span {
  color: #42b883;
}


.hero-text > p {
  margin: 20px 0 25px;

  max-width: 560px;

  color: #666;

  font-size: 17px;

  line-height: 1.7;
}


.hero-actions {
  display: flex;

  gap: 12px;

  flex-wrap: wrap;
}


.primary-button,
.secondary-button {
  padding: 12px 22px;

  border-radius: 9px;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}


.primary-button {
  border: none;

  background: #42b883;

  color: white;
}


.primary-button:hover {
  background: #369f70;

  transform: translateY(-1px);
}


.secondary-button {
  border: 1px solid #42b883;

  background: white;

  color: #42b883;
}


.secondary-button:hover {
  background: #f0faf5;
}


.partner-links {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-top: 20px;

  font-size: 13px;

  color: #999;
}


.partner-links button {
  border: none;

  background: none;

  padding: 0;

  color: #777;

  cursor: pointer;

  font-size: 13px;
}


.partner-links button:hover {
  color: #42b883;
}


.hero-visual {
  position: relative;

  width: 280px;
  height: 280px;

  display: flex;

  align-items: center;
  justify-content: center;
}


.food-circle {
  width: 210px;
  height: 210px;

  border-radius: 50%;

  background: white;

  box-shadow:
    0 15px 45px rgba(0, 0, 0, 0.10);

  display: flex;

  align-items: center;
  justify-content: center;

  font-size: 100px;
}


.floating-card {
  position: absolute;

  background: white;

  padding: 10px 14px;

  border-radius: 10px;

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.10);

  font-size: 13px;

  font-weight: 600;

  color: #444;
}


.card-one {
  top: 25px;
  right: 0;
}


.card-two {
  bottom: 30px;
  left: 0;
}


.popular-foods-section,
.restaurants-section {
  max-width: 1200px;

  margin: 65px auto;

  padding: 0 25px;
}


.section-header {
  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 20px;

  margin-bottom: 30px;
}


.section-label {
  font-size: 11px;

  font-weight: 700;

  letter-spacing: 1.5px;

  color: #42b883;
}


.section-header h2 {
  margin: 6px 0 7px;

  font-size: 30px;

  color: #222;
}


.section-header p {
  margin: 0;

  color: #777;

  font-size: 14px;
}


.view-all-button {
  border: none;

  background: none;

  color: #42b883;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  white-space: nowrap;
}


.view-all-button:hover {
  text-decoration: underline;
}


.popular-foods {
  display: flex;

  justify-content: center;

  gap: 25px;

  flex-wrap: wrap;
}


.no-foods {
  text-align: center;

  color: #777;
}


.restaurants {
  display: flex;

  justify-content: center;

  gap: 25px;

  flex-wrap: wrap;
}


@media (max-width: 750px) {

  .hero {
    padding: 40px 20px;
  }


  .hero-content {
    text-align: center;

    justify-content: center;
  }


  .hero-text {
    max-width: 600px;
  }


  .hero h1 {
    font-size: 36px;
  }


  .hero-text > p {
    margin-left: auto;
    margin-right: auto;
  }


  .hero-actions {
    justify-content: center;
  }


  .partner-links {
    justify-content: center;

    flex-wrap: wrap;
  }


  .hero-visual {
    display: none;
  }


  .section-header {
    align-items: flex-start;

    flex-direction: column;
  }

}

</style>