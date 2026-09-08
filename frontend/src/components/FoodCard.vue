<template>
  <div class="food-card">

    <img
      :src="food.imageUrl || 'https://picsum.photos/400/250'"
      alt="Food"
    >

    <div class="content">

      <h3>{{ food.name }}</h3>

      <p>{{ food.description }}</p>

      <h4>{{ food.price }} تومان</h4>

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

      <button @click="$emit('add', food)">
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

    background: white;

    border-radius: 14px;

    overflow: hidden;

    box-shadow: 0 2px 10px rgba(0,0,0,.12);

}

img {

    width: 100%;

    height: 180px;

    object-fit: cover;

}

.content {

    padding: 16px;

}

.food-stats {

    display: flex;

    flex-direction: column;

    gap: 6px;

    margin: 12px 0;

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

button:not(.reviews-button) {

    width: 100%;

    padding: 12px;

    border: none;

    border-radius: 8px;

    cursor: pointer;

    background: #42b883;

    color: white;

}

</style>