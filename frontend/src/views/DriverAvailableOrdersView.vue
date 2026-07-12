<script setup>

import { ref, onMounted } from "vue";

import {

    getAvailableOrders,

    acceptOrder

} from "../services/driver-order.service.js";

const orders = ref([]);

const loading = ref(true);

const error = ref("");

onMounted(loadOrders);

async function loadOrders(){

    loading.value = true;

    error.value = "";

    try{

        const response = await getAvailableOrders();

        orders.value = response.data;

    }

    catch(err){

        error.value = err.message;

    }

    finally{

        loading.value = false;

    }

}

async function acceptOrderHandler(order){

    try{

        await acceptOrder(order.id);

        await loadOrders();

        alert("Order accepted successfully.");

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

                🚗 Available Orders

                <span class="count">

                    ({{ orders.length }})

                </span>

            </h1>

            <p>

                Orders waiting for a driver.

            </p>

        </div>

        <button

            class="refresh-btn"

            @click="loadOrders"

        >

            🔄 Refresh

        </button>

    </div>

    <div v-if="loading" class="loading">

        Loading...

    </div>

    <div v-else-if="error" class="error">

        {{ error }}

    </div>

    <div
        v-else-if="orders.length===0"
        class="empty"
    >

        <div class="empty-icon">

            📭

        </div>

        <h2>

            No Available Orders

        </h2>

        <p>

            Please wait until a restaurant prepares a new order.

        </p>

    </div>

    <div
        v-else
        class="orders"
    >

        <div

            class="card"

            v-for="order in orders"

            :key="order.id"

        >

            <div class="card-info">

                <h2>

                    🍕

                    {{ order.restaurant.name }}

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

            </div>

            <div class="card-right">

                <h2>

                    {{ Number(order.finalPrice).toLocaleString() }}

                    تومان

                </h2>

                <button

    class="accept-btn"

    @click="acceptOrderHandler(order)"

>

    ✅ Accept Order

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

    color:#888;

    margin-top:8px;

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

.card-info{

    line-height:2;

}

.card-right{

    display:flex;

    flex-direction:column;

    align-items:flex-end;

    gap:20px;

}

.accept-btn{

    border:none;

    background:#42b883;

    color:white;

    padding:14px 22px;

    border-radius:10px;

    cursor:pointer;

    font-weight:bold;

}

.accept-btn:hover{

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

