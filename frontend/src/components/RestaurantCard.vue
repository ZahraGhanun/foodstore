<template>

  <div class="card">

    <img
      :src="image"
      :alt="name"
    />

    <div class="content">

      <h3>
        {{ name }}
      </h3>

      <p>
        {{ description }}
      </p>


      <!-- Restaurant Stats -->

      <div class="restaurant-stats">

        <span class="rating">
          ⭐ {{ avgRating }}
        </span>

        <span class="reviews">
          💬 {{ totalReviews }} reviews
        </span>

        <span class="orders">
          🛒 {{ orderCount }} orders
        </span>

      </div>


      <RouterLink
        :to="`/restaurants/${id}`"
      >

        <button>
          View Menu
        </button>

      </RouterLink>

    </div>

  </div>

</template>


<script setup>

defineProps({

  id: String,

  name: String,

  description: String,

  image: {
    type: String,
    default: "https://picsum.photos/300/180"
  },

  avgRating: {
    type: [Number, String],
    default: 0
  },

  totalReviews: {
    type: Number,
    default: 0
  },

  orderCount: {
    type: Number,
    default: 0
  }

});

</script>


<style scoped>

.card {

  width: 300px;

  background: white;

  border-radius: 12px;

  overflow: hidden;

  box-shadow: 0 2px 10px rgba(0,0,0,.1);

}


img {

  width: 100%;

  height: 180px;

  object-fit: cover;

  display: block;

}


.content {

  padding: 16px;

}


h3 {

  margin: 0 0 10px;

}


p {

  color: #666;

  margin-bottom: 16px;

}


/* =========================
   Restaurant Stats
========================= */

.restaurant-stats {

  display: flex;

  align-items: center;

  gap: 15px;

  margin-bottom: 16px;

  font-size: 14px;

  flex-wrap: wrap;

}


.rating {

  font-weight: bold;

  color: #b77900;

}


.reviews {

  color: #666;

}


.orders {

  color: #666;

}


/* =========================
   Button
========================= */

button {

  width: 100%;

  padding: 10px;

  border: none;

  border-radius: 8px;

  background: #42b883;

  color: white;

  cursor: pointer;

}

</style>
