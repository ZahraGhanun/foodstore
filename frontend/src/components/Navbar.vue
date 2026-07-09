<template>
  <nav class="navbar">

    <div class="logo">
      🍕 FoodStore
    </div>

    <ul class="menu">

      <li>
        <RouterLink to="/">Home</RouterLink>
      </li>

      <!-- قبل از لاگین -->
      <template v-if="!user">

        <li>
          <RouterLink to="/login">
            Login
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/register">
            Register
          </RouterLink>
        </li>

      </template>

      <!-- بعد از لاگین -->
      <template v-else>

        <li>
          <RouterLink to="/cart">
            Cart
          </RouterLink>
        </li>

        <li v-if="isRestaurantManager">
          <RouterLink to="/restaurant-dashboard">
            🍕 Dashboard
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/profile">
            👤 {{ user.firstName }}
          </RouterLink>
        </li>

        <li>
          <button @click="logout">
            Logout
          </button>
        </li>

      </template>

    </ul>

  </nav>
</template>

<script setup>
import { computed } from "vue";
import { user, logout } from "../stores/auth.js";

const isRestaurantManager = computed(() => {

    return user.value?.roles?.includes("RestaurantManager");

});
</script>

<style scoped>

.navbar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:20px 60px;
    background:white;
    border-bottom:1px solid #e5e5e5;
}

.logo{
    font-size:28px;
    font-weight:bold;
    color:#42b883;
}

.menu{
    display:flex;
    gap:30px;
    list-style:none;
    align-items:center;
}

.menu a{
    text-decoration:none;
    color:#333;
    font-weight:600;
    padding:6px 10px;
    border-radius:6px;
    transition:.2s;
}

.menu a:hover{
    color:#42b883;
}

.router-link-active{
    color:#42b883;
    font-weight:bold;
}

button{
    background:none;
    border:none;
    cursor:pointer;
    color:#333;
    font-weight:600;
    font-size:16px;
    transition:.2s;
}

button:hover{
    color:#42b883;
}

</style>