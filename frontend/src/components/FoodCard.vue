<template>
  <div class="food-card">

    <img
      :src="food.imageUrl || 'https://picsum.photos/400/250'"
      alt="Food"
    >

    <div class="content">

      <h3>
        {{ food.name }}
      </h3>

      <p class="description">
        {{ food.description || "No description available." }}
      </p>

      <h4>
        {{ food.price }} تومان
      </h4>

      <div class="food-stats">

        <span>
          🛒 {{ food.orderCount }} orders
        </span>

        <span>
          ⭐ {{ food.avgRating }}
        </span>

        <button
          class="reviews-button"
          @click="goToReviews"
        >
          💬 {{ food.reviewCount }} reviews
        </button>

      </div>

      <button
        class="add-to-cart-button"
        @click="$emit('add', food)"
      >
        Add To Cart
      </button>

    </div>

  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  food: Object
});

defineEmits([
  "add"
]);

function goToReviews() {

  router.push(
    `/restaurants/${props.food.restaurantId}/foods/${props.food.id}/reviews`
  );

}
</script>

<style scoped>

.food-card {

    width: 280px;

    height: 470px;

    display: flex;

    flex-direction: column;

    background: white;

    border-radius: 14px;

    overflow: hidden;

    box-shadow: 0 2px 10px rgba(0, 0, 0, .12);

}

img {

    width: 100%;

    height: 180px;

    flex-shrink: 0;

    object-fit: cover;

}

.content {

    flex: 1;

    display: flex;

    flex-direction: column;

    padding: 16px;

    min-height: 0;

}

h3 {

    height: 48px;

    margin: 0 0 8px;

    font-size: 18px;

    line-height: 24px;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;

}

.description {

    height: 54px;

    margin: 0 0 12px;

    font-size: 14px;

    line-height: 18px;

    color: #666;

    display: -webkit-box;

    -webkit-line-clamp: 3;

    -webkit-box-orient: vertical;

    overflow: hidden;

}

h4 {

    height: 24px;

    margin: 0 0 8px;

    font-size: 17px;

    line-height: 24px;

    color: #333;

}

.food-stats {

    display: flex;

    flex-direction: column;

    gap: 6px;

    height: 78px;

    margin: 4px 0 12px;

    font-size: 14px;

    color: #555;

}

.reviews-button {

    background: none;

    border: none;

    padding: 0;

    color: #42b883;

    cursor: pointer;

    font-size: 14px;

    text-align: left;

}

.add-to-cart-button {

    width: 100%;

    height: 44px;

    flex-shrink: 0;

    padding: 12px;

    border: none;

    border-radius: 8px;

    cursor: pointer;

    background: #42b883;

    color: white;

}

.add-to-cart-button:hover {

    background: #369f70;

}

</style>