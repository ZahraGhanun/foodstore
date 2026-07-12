
<script setup>
import { ref, onMounted } from "vue";

import {

    getRestaurantOrders,
    updateOrderStatus

} from "../services/restaurant-order.service.js";


import OrderDetailsModal

    from "../components/OrderDetailsModal.vue";


const orders = ref([]);

const loading = ref(true);

const error = ref("");

 
const showDetails = ref(false);

const selectedOrder = ref(null);

const statuses = [

    "PENDING",

    "ACCEPTED",

    "PREPARING",

    "READY_FOR_PICKUP",

    "CANCELLED"

];

function openDetails(order){

    selectedOrder.value = order;

    showDetails.value = true;

}




onMounted(loadOrders);

async function loadOrders() {

    loading.value = true;

    error.value = "";

    try {

        const response = await getRestaurantOrders();

        orders.value = response.data;

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}


async function changeStatus(order){

    try{

        await updateOrderStatus(

            order.id,

            order.status

        );

        await loadOrders();

    }

    catch(err){

        alert(err.message);

    }

}


function statusColor(status) {

    switch (status) {

        case "PENDING":

            return "#f59e0b";

        case "PREPARING":

            return "#3b82f6";

        case "ON_THE_WAY":

            return "#8b5cf6";

        case "DELIVERED":

            return "#10b981";

        case "CANCELLED":

            return "#ef4444";

        default:

            return "#6b7280";

    }

}
</script>
 

<template>

<div class="container">

    <div class="header">

        <div>

            <h1>

                📦 Manage Orders

                <span class="count">

                    ({{ orders.length }})

                </span>

            </h1>

            <p>

                View and manage your restaurant orders.

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
        v-else-if="orders.length === 0"
        class="empty"
    >

        No orders found.

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

            <div class="info">

                <h2>

                    📦 Order #{{ order.id.slice(0,8) }}

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

                    📅

                    {{ new Date(order.createdAt).toLocaleString() }}

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

            <div class="right">

                <select
                    v-model="order.status"
                    class="status-select"
                >

                    <option
                        v-for="status in statuses"
                        :key="status"
                        :value="status"
                    >

                        {{ status }}

                    </option>

                </select>

          
<button

    class="details-btn"

    @click="openDetails(order)"

>

    👁 Details

</button>



                <button
                    class="change-btn"
                    @click="changeStatus(order)"
                >

                    💾 Update

                </button>

            </div>

        </div>

    </div>

</div>


<OrderDetailsModal

    v-model="showDetails"

    :order="selectedOrder"

/>



</template>


<style scoped>

.details-btn{

    border:none;

    padding:10px 16px;

    border-radius:8px;

    background:#6b7280;

    color:white;

    cursor:pointer;

    font-weight:bold;

}

.details-btn:hover{

    background:#4b5563;

}


.container{

    max-width:1100px;

    margin:40px auto;

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}

.header p{

    color:#666;

    margin-top:8px;

}

.count{

    color:#42b883;

}

.refresh-btn{

    border:none;

    padding:12px 20px;

    border-radius:10px;

    background:#42b883;

    color:white;

    cursor:pointer;

    font-weight:bold;

}

.orders{

    display:flex;

    flex-direction:column;

    gap:20px;

}

.card{

    background:white;

    border-radius:16px;

    padding:22px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

    transition:.2s;

}

.card:hover{

    transform:translateY(-3px);

    box-shadow:0 8px 20px rgba(0,0,0,.12);

}

.info h2{

    margin-bottom:10px;

}

.info p{

    color:#666;

    margin-bottom:8px;

}

.info strong{

    color:#42b883;

    font-size:18px;

}

.right{

    display:flex;

    flex-direction:column;

    gap:12px;

    align-items:flex-end;

}

.status{

    color:white;

    padding:8px 16px;

    border-radius:20px;

    font-weight:bold;

}

.change-btn{

    border:none;

    padding:10px 16px;

    border-radius:8px;

    background:#3b82f6;

    color:white;

    cursor:pointer;

    font-weight:bold;

}

.empty{

    background:white;

    border-radius:16px;

    padding:70px;

    text-align:center;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

}


.status-select{

    padding:10px;

    border-radius:8px;

    border:1px solid #ddd;

    font-size:14px;

    width:180px;

}



@media(max-width:700px){

    .card{

        flex-direction:column;

        align-items:flex-start;

        gap:20px;

    }

    .right{

        width:100%;

        align-items:stretch;

    }

}
</style>
