<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getOrderById } from "../services/order.service.js";

const route = useRoute();
const router = useRouter();

const order = ref(null);

const loading = ref(true);

const error = ref("");

onMounted(loadOrder);

async function loadOrder() {

    try {

        const response = await getOrderById(route.params.id);

        order.value = response.data;

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}

const subtotal = computed(() => {

    if (!order.value) return 0;

    return order.value.orderItems.reduce((sum, item) => {

        return sum + Number(item.unitPrice) * item.quantity;

    }, 0);

});

const deliveryFee = computed(() => {

    if (!order.value) return 0;

    return Number(order.value.deliveryFee ?? 20000);

});

const total = computed(() => {

    if (!order.value) return 0;

    return Number(order.value.finalPrice);

});

function statusColor(status) {

    switch (status) {

        case "PENDING":

            return "#f59e0b";

        case "PREPARING":

            return "#3b82f6";

        case "ON_THE_WAY":

            return "#10b981";

        case "DELIVERED":

            return "#22c55e";

        case "CANCELLED":

            return "#ef4444";

        default:

            return "#999";

    }

}

function goBack() {

    router.back();

}
</script>

<template>

<div class="container">

<button
class="back"
@click="goBack"
>

← Back

</button>

<div v-if="loading">

<h2>Loading...</h2>

</div>

<div v-else-if="error">

<h2>{{ error }}</h2>

</div><div v-else>

<div class="card">

<div class="header">

<div>

<h1>

Order #{{ order.id.slice(0,8) }}

</h1>

<p>

{{ new Date(order.createdAt).toLocaleString() }}

</p>

</div>

<span

class="status"

:style="{background:statusColor(order.status)}"

>

{{ order.status }}

</span>

</div>

<hr>

<h2>

Delivery Address

</h2>

<div class="address">

<p>

<strong>{{ order.deliveryAddress.title }}</strong>

</p>

<p>

{{ order.deliveryAddress.receiverName }}

</p>

<p>

{{ order.deliveryAddress.receiverPhone }}

</p>

<p>

{{ order.deliveryAddress.address }}

</p>

</div>

<hr>

<h2>

Items

</h2>

<div

v-for="item in order.orderItems"

:key="item.id"

class="item"

>

<div>

<h3>

{{ item.food.name }}

</h3>

<p>

{{ Number(item.unitPrice).toLocaleString() }}

تومان

× {{ item.quantity }}

</p>

</div>

<strong>

{{ (Number(item.unitPrice) * item.quantity).toLocaleString() }}

تومان

</strong>

</div>

<hr>

<div class="summary">

<div>

<span>

Subtotal

</span>

<strong>

{{ subtotal.toLocaleString() }}

تومان

</strong>

</div>

<div>

<span>

Delivery

</span>

<strong>

{{ deliveryFee.toLocaleString() }}

تومان

</strong>

</div>

<div class="total">

<span>

Total

</span>

<strong>

{{ total.toLocaleString() }}

تومان

</strong>

</div>

</div>

</div>

</div>

</div>

</template>

<style scoped>

.container{

max-width:900px;

margin:40px auto;

}

.back{

margin-bottom:20px;

padding:10px 18px;

border:none;

border-radius:8px;

background:#42b883;

color:white;

cursor:pointer;

}

.card{

background:white;

padding:30px;

border-radius:14px;

box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:20px;

}

.status{

padding:8px 14px;

border-radius:20px;

color:white;

font-weight:bold;

font-size:14px;

}

.address{

background:#f8f8f8;

padding:18px;

border-radius:10px;

margin:15px 0;

}

.item{

display:flex;

justify-content:space-between;

align-items:center;

padding:15px 0;

border-bottom:1px solid #eee;

}

.item:last-child{

border-bottom:none;

}

.summary{

margin-top:25px;

display:flex;

flex-direction:column;

gap:15px;

}

.summary>div{

display:flex;

justify-content:space-between;

}

.total{

font-size:20px;

font-weight:bold;

padding-top:15px;

border-top:2px solid #ddd;

}

h2{

margin-top:25px;

margin-bottom:10px;

}

</style>