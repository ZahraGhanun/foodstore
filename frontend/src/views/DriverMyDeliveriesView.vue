
<script setup>

import { ref, onMounted } from "vue";

import {

    getMyDeliveries,

    deliverOrder

} from "../services/driver-order.service.js";

const orders = ref([]);

const loading = ref(true);

const error = ref("");

onMounted(loadOrders);

async function loadOrders(){

    loading.value = true;

    error.value = "";

    try{

        const response = await getMyDeliveries();

        orders.value = response.data;

    }

    catch(err){

        error.value = err.message;

    }

    finally{

        loading.value = false;

    }

}

async function deliver(order){

    try{

        await deliverOrder(order.id);

        await loadOrders();

        alert("Order delivered successfully.");

    }

    catch(err){

        alert(err.message);

    }

}

</script>

<template>

<div class="page">

    <div class="header">

        <div>

            <h1>

                🚚 My Deliveries

                <span class="count">

                    ({{ orders.length }})

                </span>

            </h1>

            <p>

                Orders currently assigned to you.

            </p>

        </div>

        <button

            class="refresh-btn"

            @click="loadOrders"

        >

            🔄 Refresh

        </button>

    </div>

    <div v-if="loading">

        Loading...

    </div>

    <div v-else-if="error">

        {{ error }}

    </div>

    <div
    v-else-if="orders.length===0"
    class="empty"
>

    <div class="empty-icon">

        🚚

    </div>

    <h2>

        No Active Deliveries

    </h2>

    <p>

        Accept an order to start delivering.

    </p>

</div>

    <div

        v-else

        class="orders"

    >

        <div

            v-for="order in orders"

            :key="order.id"

            class="card"

        >

            <div class="left">

                <h2>

                    🍕 {{ order.restaurant.name }}

                </h2>

                <p>

                    👤

                    {{ order.user.firstName }}

                    {{ order.user.lastName }}

                </p>

                <p>

                    📞

                    {{ order.user.phone }}

                </p>

                <p>

                    📍

                    {{ order.deliveryAddress.address }}

                </p>

                <p>

                    🍔

                    {{ order.orderItems.length }}

                    Foods

                </p>

                <strong>

                    💰

                    {{ Number(order.finalPrice).toLocaleString() }}

                    تومان

                </strong>

            </div>

            <div class="card-right">

    <div class="status">

        📦 {{ order.status }}

    </div>

    <h2>

        {{ Number(order.finalPrice).toLocaleString() }}

        تومان

    </h2>

    <button

        class="deliver-btn"

        @click="deliver(order)"

    >

        ✅ Deliver Order

    </button>

</div>

        </div>

    </div>

</div>

</template>

<style scoped>

.page{

    width:100%;

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}

.header h1{

    margin:0;

    font-size:40px;

}

.count{

    color:#42b883;

}

.header p{

    margin-top:8px;

    color:#888;

}

.refresh-btn{

    border:none;

    background:#42b883;

    color:white;

    padding:12px 20px;

    border-radius:10px;

    cursor:pointer;

    font-weight:bold;

}

.refresh-btn:hover{

    background:#369f74;

}

.orders{

    display:flex;

    flex-direction:column;

    gap:20px;

}

.card{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:24px;

    border-radius:16px;

    background:white;

    box-shadow:0 4px 15px rgba(0,0,0,.08);

}

.left{

    line-height:2;

}

.card-right{

    display:flex;

    flex-direction:column;

    align-items:flex-end;

    gap:18px;

}

.status{

    background:#42b88322;

    color:#42b883;

    padding:6px 12px;

    border-radius:8px;

    font-weight:bold;

}

.deliver-btn{

    border:none;

    background:#42b883;

    color:white;

    padding:14px 22px;

    border-radius:10px;

    cursor:pointer;

    font-weight:bold;

}

.deliver-btn:hover{

    background:#369f74;

}

.empty{

    height:350px;

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

    color:#888;

}

.empty-icon{

    font-size:80px;

    margin-bottom:20px;

}

.loading,

.error{

    padding:40px;

    text-align:center;

}

</style>