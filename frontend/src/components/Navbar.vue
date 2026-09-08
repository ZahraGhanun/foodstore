<template>
  <nav class="navbar">

    <!-- Logo -->
    <div class="logo">
      🍕 FoodStore
    </div>


    <!-- Menu -->
    <ul class="menu">

      <!-- Home -->
      <li>
        <RouterLink to="/">
          Home
        </RouterLink>
      </li>


      <!-- ================================= -->
      <!-- قبل از Login -->
      <!-- ================================= -->

      <template v-if="!user">

        <!-- Driver Registration -->
        <li>
          <RouterLink to="/driver-register">
            🛵 Register as Driver
          </RouterLink>
        </li>


        <!-- Restaurant Registration -->
        <li>
          <RouterLink to="/restaurant-register">
            🏪 Register Restaurant
          </RouterLink>
        </li>


        <!-- Login -->
        <li>
          <RouterLink to="/login">
            Login
          </RouterLink>
        </li>


        <!-- Register -->
        <li>
          <RouterLink to="/register">
            Register
          </RouterLink>
        </li>

      </template>


      <!-- ================================= -->
      <!-- بعد از Login -->
      <!-- ================================= -->

      <template v-else>

        <!-- Driver Registration -->
        <li v-if="!isDriver">
          <RouterLink to="/driver-register">
            🛵 Register as Driver
          </RouterLink>
        </li>


        <!-- Restaurant Registration -->
        <li v-if="!isRestaurantManager">
          <RouterLink to="/restaurant-register">
            🏪 Register Restaurant
          </RouterLink>
        </li>


        <!-- Cart -->
        <li>
          <RouterLink to="/cart">
            🛒 Cart
          </RouterLink>
        </li>


        <!-- Driver Dashboard -->
        <li v-if="isDriver">
          <RouterLink to="/driver-dashboard">
            🚗 Driver Dashboard
          </RouterLink>
        </li>


        <!-- Restaurant Dashboard -->
        <li v-if="isRestaurantManager">
          <RouterLink to="/restaurant-dashboard">
            🍕 Restaurant Dashboard
          </RouterLink>
        </li>


        <!-- Admin Dashboard -->
        <li v-if="isSystemAdmin">
          <RouterLink to="/admin-dashboard">
            👑 Admin Dashboard
          </RouterLink>
        </li>


        <!-- Profile -->
        <li>
          <RouterLink to="/profile">
            👤 Profile {{ user.firstName }}
          </RouterLink>
        </li>


        <!-- Logout -->
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

import {
  user,
  logout
} from "../stores/auth.js";


// =================================
// Driver Role
// =================================

const isDriver = computed(() => {

  return user.value?.roles?.includes("Driver");

});


// =================================
// Restaurant Manager Role
// =================================

const isRestaurantManager = computed(() => {

  return user.value?.roles?.includes("RestaurantManager");

});


// =================================
// System Admin Role
// =================================

const isSystemAdmin = computed(() => {

  return user.value?.roles?.includes("SystemAdmin");

});

</script>


<style scoped>

.navbar {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 16px 30px;

  background: white;

  border-bottom: 1px solid #e5e5e5;

}


.logo {

  font-size: 30px;

  font-weight: bold;

  color: #42b883;

}


.menu {

  display: flex;

  gap: 12px;

  list-style: none;

  align-items: center;

  margin: 0;

  padding: 0;

  white-space: nowrap;

}


.menu a {

  text-decoration: none;

  color: #333;

  font-weight: 600;

  font-size: 18px;

  padding: 7px 8px;

  border-radius: 6px;

  transition: .2s;

}


.menu a:hover {

  color: #42b883;

}


.router-link-active {

  color: #42b883;

  font-weight: bold;

}


button {

  background: none;

  border: none;

  cursor: pointer;

  color: #333;

  font-weight: 600;

  font-size: 18px;

  padding: 7px 8px;

  transition: .2s;

}


button:hover {

  color: #42b883;

}

</style>