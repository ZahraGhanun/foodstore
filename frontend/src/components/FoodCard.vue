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

      <button @click="$emit('add', food)">
        Add To Cart
      </button>

    </div>

  </div>
</template>

<script setup>
defineProps({
  food: Object
});

defineEmits([
  "add"
]);
</script>

<style scoped>

.food-card{

    width:280px;

    background:white;

    border-radius:14px;

    overflow:hidden;

    box-shadow:0 2px 10px rgba(0,0,0,.12);

}

img{

    width:100%;

    height:180px;

    object-fit:cover;

}

.content{

    padding:16px;

}

button{

    width:100%;

    padding:12px;

    border:none;

    border-radius:8px;

    cursor:pointer;

    background:#42b883;

    color:white;

}

</style>