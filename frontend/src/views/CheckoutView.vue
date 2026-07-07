<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

import { getCart } from "../services/cart.service.js";
import { getAddresses } from "../services/delivery-address.service.js";
import { createOrder } from "../services/order.service.js";

const router = useRouter();

const cart = ref(null);

const addresses = ref([]);

const selectedAddress = ref("");

const loading = ref(true);

const placingOrder = ref(false);

const error = ref("");

const DELIVERY_FEE = 20000;

const subtotal = computed(() => {

    if (!cart.value) return 0;

    return cart.value.cartItems.reduce((sum, item) => {

        return sum + Number(item.food.price) * item.quantity;

    }, 0);

});

const total = computed(() => {

    return subtotal.value + DELIVERY_FEE;

});

onMounted(loadData);

async function loadData() {

    loading.value = true;

    error.value = "";

    try {

        const [cartResponse, addressResponse] = await Promise.all([

            getCart(),

            getAddresses()

        ]);

        cart.value = cartResponse.data;

        addresses.value = addressResponse.data;

        const defaultAddress = addresses.value.find(

            address => address.isDefault

        );

        if (defaultAddress) {

            selectedAddress.value = defaultAddress.id;

        }

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}

async function submitOrder() {

    if (!selectedAddress.value) {

        alert("Please select a delivery address.");

        return;

    }

    placingOrder.value = true;

    try {

        await createOrder(selectedAddress.value);

        alert("Order placed successfully.");

        router.push("/profile");

    }

    catch (err) {

        alert(err.message);

    }

    finally {

        placingOrder.value = false;

    }

}
</script>

<template>

<div class="container">

<h1>Checkout</h1>

<div v-if="loading">

Loading...

</div>

<div v-else-if="error">

{{ error }}

</div>

<div v-else>

<div class="section">

<h2>Delivery Address</h2>

<label

v-for="address in addresses"

:key="address.id"

class="address"

>

<input

type="radio"

name="address"

:value="address.id"

v-model="selectedAddress"

/>

<div>

<strong>

{{ address.title }}

<span v-if="address.isDefault">

⭐

</span>

</strong>

<p>

{{ address.receiverName }}

</p>

<p>

{{ address.receiverPhone }}

</p>

<p>

{{ address.address }}

</p>

</div>

</label>

</div>

<div class="section">

<h2>Order Summary</h2>

<div

v-for="item in cart.cartItems"

:key="item.id"

class="item"

>

<span>

{{ item.food.name }}

× {{ item.quantity }}

</span>

<strong>

{{ (Number(item.food.price) * item.quantity).toLocaleString() }}

تومان

</strong>

</div>

<hr>

<div class="item">

<span>

Subtotal

</span>

<strong>

{{ subtotal.toLocaleString() }}

تومان

</strong>

</div>

<div class="item">

<span>

Delivery

</span>

<strong>

{{ DELIVERY_FEE.toLocaleString() }}

تومان

</strong>

</div>

<div class="item total">

<span>

Total

</span>

<strong>

{{ total.toLocaleString() }}

تومان

</strong>

</div>

<button

class="checkout"

@click="submitOrder"

:disabled="placingOrder"

>

{{ placingOrder ? "Placing Order..." : "Place Order" }}

</button>

</div>

</div>

</div>

</template>

<style scoped>

.container{

max-width:900px;

margin:40px auto;

}

.section{

background:white;

padding:25px;

border-radius:12px;

margin-bottom:25px;

box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.address{

display:flex;

gap:15px;

padding:15px;

border:1px solid #ddd;

border-radius:10px;

margin-bottom:15px;

cursor:pointer;

}

.item{

display:flex;

justify-content:space-between;

margin:12px 0;

}

.total{

font-size:18px;

font-weight:bold;

}

.checkout{

margin-top:20px;

width:100%;

padding:14px;

border:none;

border-radius:10px;

background:#42b883;

color:white;

font-size:16px;

cursor:pointer;

}

.checkout:disabled{

opacity:.6;

cursor:not-allowed;

}

</style>