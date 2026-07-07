<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

import {
  getCart,
  updateQuantity,
  removeItem
} from "../services/cart.service.js";

const router = useRouter();

const cart = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {

  try {

    const response = await getCart();

    cart.value = response.data;

  } catch (err) {

    error.value = err.message;

  } finally {

    loading.value = false;

  }

});

async function changeQuantity(item, amount) {

  const newQuantity = item.quantity + amount;

  if (newQuantity < 1) return;

  try {

    await updateQuantity(item.id, newQuantity);

    item.quantity = newQuantity;

  } catch (err) {

    alert(err.message);

  }

}

async function deleteItem(itemId) {

  try {

    await removeItem(itemId);

    cart.value.cartItems =
      cart.value.cartItems.filter(i => i.id !== itemId);

  } catch (err) {

    alert(err.message);

  }

}

const subtotal = computed(() => {

  if (!cart.value) return 0;

  return cart.value.cartItems.reduce((sum, item) => {

    return sum + Number(item.food.price) * item.quantity;

  }, 0);

});

const isCartEmpty = computed(() => {

  return !cart.value || cart.value.cartItems.length === 0;

});

function checkout() {

  if (isCartEmpty.value) return;

  router.push("/checkout");

}

function browseRestaurants() {

  router.push("/");

}
</script>

<template>

<div class="container">

<h1>🛒 Your Cart</h1>

<div v-if="loading">

<h2>Loading...</h2>

</div>

<div v-else-if="error">

<h2>{{ error }}</h2>

</div>

<div v-else-if="isCartEmpty" class="empty-cart">

<div class="emoji">

🛒

</div>

<h2>Your cart is empty</h2>

<p>

Looks like you haven't added any food yet.

</p>

<button

class="browse-btn"

@click="browseRestaurants"

>

Browse Restaurants

</button>

</div>

<div v-else>

<div

v-for="item in cart.cartItems"

:key="item.id"

class="item"

>

<img

:src="item.food.imageUrl || 'https://picsum.photos/120'"

alt="Food"

/>

<div class="info">

<h3>{{ item.food.name }}</h3>

<p>{{ item.food.description }}</p>

<strong>

{{ Number(item.food.price).toLocaleString() }}

تومان

</strong>

<div class="quantity">

<button @click="changeQuantity(item,-1)">

−

</button>

<span>

{{ item.quantity }}

</span>

<button @click="changeQuantity(item,1)">

+

</button>

</div>

</div>

<button

class="delete-btn"

@click="deleteItem(item.id)"

>

🗑

</button>

</div>

<hr>

<div class="summary">

<h2>

Subtotal

</h2>

<h2>

{{ subtotal.toLocaleString() }}

تومان

</h2>

</div>

<button

class="checkout"

@click="checkout"

>

Proceed To Checkout

</button>

</div>

</div>

</template>

<style scoped>

.container{

max-width:950px;

margin:50px auto;

}

.item{

display:flex;

align-items:center;

gap:20px;

padding:20px;

margin-bottom:18px;

border-radius:14px;

background:white;

box-shadow:0 2px 10px rgba(0,0,0,.1);

}

img{

width:120px;

height:120px;

object-fit:cover;

border-radius:12px;

}

.info{

flex:1;

}

.quantity{

display:flex;

gap:12px;

align-items:center;

margin-top:12px;

}

.quantity button{

width:36px;

height:36px;

border:none;

border-radius:8px;

background:#42b883;

color:white;

cursor:pointer;

font-size:20px;

}

.quantity span{

font-weight:bold;

font-size:18px;

min-width:25px;

text-align:center;

}

.delete-btn{

border:none;

background:#ff4d4f;

color:white;

padding:12px;

border-radius:10px;

cursor:pointer;

font-size:18px;

}

.summary{

display:flex;

justify-content:space-between;

align-items:center;

margin:30px 0;

}

.checkout{

width:100%;

padding:18px;

border:none;

border-radius:12px;

background:#42b883;

color:white;

font-size:18px;

font-weight:bold;

cursor:pointer;

transition:.2s;

}

.checkout:hover{

background:#369f74;

}

.empty-cart{

background:white;

padding:70px 30px;

border-radius:16px;

text-align:center;

box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.emoji{

font-size:70px;

margin-bottom:15px;

}

.empty-cart h2{

margin-bottom:10px;

}

.empty-cart p{

color:#777;

margin-bottom:30px;

}

.browse-btn{

padding:16px 30px;

border:none;

border-radius:12px;

background:#42b883;

color:white;

font-size:17px;

font-weight:bold;

cursor:pointer;

transition:.2s;

}

.browse-btn:hover{

background:#369f74;

}

</style>