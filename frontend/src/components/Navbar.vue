<template>
  <nav class="navbar">

    <div class="logo">
      🍕 FoodStore
    </div>

    <ul class="menu">

      <li>
        <RouterLink to="/">Home</RouterLink>
      </li>


      <!-- اگر لاگین نکرده -->
      <template v-if="!user">
        <li>
          <RouterLink to="/login">Login</RouterLink>
        </li>

        <li>
          <RouterLink to="/register">Register</RouterLink>
        </li>
      </template>

      <!-- اگر لاگین کرده -->
      <template v-else>

        <li class="user">
          👤 {{ user.firstName }}
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
import { user, logout } from "../stores/auth.js";
</script>

<style scoped>

.navbar{
  display:flex;
  justify-content:space-between;
  align-items:center;

  padding:18px 50px;

  background: linear-gradient(135deg, #fff, #f7f7f7);
  border-bottom:1px solid #eee;
  position: sticky;
  top: 0;
}

.logo{
  font-size:26px;
  font-weight:800;
  color:#42b883;
}

.menu{
  display:flex;
  gap:20px;
  list-style:none;
  align-items:center;
}

.menu a{
  text-decoration:none;
  color:#444;
  font-weight:600;
  padding:6px 10px;
  border-radius:6px;
}

.menu a:hover{
  background:#42b883;
  color:white;
}

.router-link-active{
  background:#42b883;
  color:white;
}

.user{
  font-weight:600;
  color:#333;
}

button{
  padding:6px 12px;
  border:none;
  background:red;
  color:white;
  border-radius:6px;
  cursor:pointer;
}

</style>