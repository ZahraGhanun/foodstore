<template>
  <div class="card">
    <img
      src="https://picsum.photos/300/180"
      alt="Restaurant"
    />

    <div class="content">
      <h3>{{ name }}</h3>

      <p>{{ description }}</p>

      <RouterLink :to="`/restaurants/${id}`">
    <button>View Menu</button>
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