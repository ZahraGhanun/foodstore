<script setup>

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { getMyOrders } from "../services/order.service.js";

const router = useRouter();

const orders = ref([]);

const loading = ref(true);

const error = ref("");

onMounted(loadOrders);

async function loadOrders() {

    try {

        const response = await getMyOrders();

        orders.value = response.data;

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}

function openOrder(id) {

    router.push(`/orders/${id}`);

}

function statusColor(status) {

    switch (status) {

        case "PENDING":

            return "#f59e0b";

        case "PREPARING":

            return "#3b82f6";

        case "ON_THE_WAY":

            return "#10b981";

        case "DELIVERED":

            return "#16a34a";

        case "CANCELLED":

            return "#ef4444";

        default:

            return "#999";

    }

}

</script>

<template>

<div>

<h2>My Orders</h2>

<div v-if="loading">

Loading...

</div>

<div v-else-if="error">

{{ error }}

</div>

<div
v-else-if="orders.length===0"
>

You have no orders yet.

</div>

<div

v-for="order in orders"

:key="order.id"

class="card"

>

<div class="top">

<div>

<h3>

Order #{{ order.id.slice(0,8) }}

</h3>

<p>

{{ new Date(order.createdAt).toLocaleString() }}

</p>

</div>

<span

class="status"

:style="{

background:statusColor(order.status)

}"

>

{{ order.status }}

</span>

</div>

<div class="bottom">

<strong>

{{ Number(order.finalPrice).toLocaleString() }}

تومان

</strong>

<button

@click="openOrder(order.id)"

>

View Details

</button>

</div>

</div>

</div>

</template>

<style scoped>

.card{

padding:20px;

border-radius:12px;

background:white;

margin-bottom:18px;

box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.top{

display:flex;

justify-content:space-between;

align-items:center;

}

.bottom{

display:flex;

justify-content:space-between;

align-items:center;

margin-top:20px;

}

.status{

padding:6px 12px;

border-radius:20px;

color:white;

font-size:13px;

}

button{

padding:10px 16px;

border:none;

border-radius:8px;

background:#42b883;

color:white;

cursor:pointer;

}

</style>