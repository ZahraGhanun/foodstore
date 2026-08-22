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


onMounted(loadOrders);


async function loadOrders() {

    loading.value = true;

    error.value = "";

    try {

        const response =
            await getRestaurantOrders();

        orders.value =
            response.data;

    }

    catch (err) {

        error.value =
            err.message;

    }

    finally {

        loading.value = false;

    }

}


async function changeStatus(order) {

    try {

        await updateOrderStatus(

            order.id,

            order.status

        );

        await loadOrders();

    }

    catch (err) {

        alert(err.message);

    }

}


function openDetails(order) {

    selectedOrder.value =
        order;

    showDetails.value =
        true;

}


function statusLabel(status) {

    switch (status) {

        case "PENDING":
            return "Pending";

        case "ACCEPTED":
            return "Accepted";

        case "PREPARING":
            return "Preparing";

        case "READY_FOR_PICKUP":
            return "Ready for Pickup";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status;

    }

}


function statusClass(status) {

    switch (status) {

        case "PENDING":
            return "pending";

        case "ACCEPTED":
            return "accepted";

        case "PREPARING":
            return "preparing";

        case "READY_FOR_PICKUP":
            return "ready";

        case "CANCELLED":
            return "cancelled";

        default:
            return "unknown";

    }

}


function statusIcon(status) {

    switch (status) {

        case "PENDING":
            return "⏳";

        case "ACCEPTED":
            return "✅";

        case "PREPARING":
            return "👨‍🍳";

        case "READY_FOR_PICKUP":
            return "📦";

        case "CANCELLED":
            return "❌";

        default:
            return "📋";

    }

}

</script>


<template>

<div class="container">


    <!-- ========================= -->
    <!-- HEADER -->
    <!-- ========================= -->

    <div class="header">

        <div>

            <h1>

                📦 Manage Orders

                <span class="count">

                    {{ orders.length }}

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



    <!-- ========================= -->
    <!-- LOADING -->
    <!-- ========================= -->

    <div
        v-if="loading"
        class="loading"
    >

        <div class="loading-icon">

            📦

        </div>

        <p>

            Loading orders...

        </p>

    </div>



    <!-- ========================= -->
    <!-- ERROR -->
    <!-- ========================= -->

    <div
        v-else-if="error"
        class="error"
    >

        <span>

            ⚠️

        </span>

        {{ error }}

    </div>



    <!-- ========================= -->
    <!-- EMPTY -->
    <!-- ========================= -->

    <div
        v-else-if="orders.length === 0"
        class="empty"
    >

        <div class="empty-icon">

            📦

        </div>

        <h2>

            No Orders Yet

        </h2>

        <p>

            When customers place orders,
            they will appear here.

        </p>

    </div>



    <!-- ========================= -->
    <!-- ORDERS -->
    <!-- ========================= -->

    <div
        v-else
        class="orders"
    >


        <div
            v-for="order in orders"
            :key="order.id"
            class="card"
        >


            <!-- ORDER INFORMATION -->

            <div class="info">


                <div class="order-title">

                    <div class="order-icon">

                        📦

                    </div>

                    <div>

                        <h2>

                            Order #{{ order.id.slice(0,8) }}

                        </h2>

                        <span class="order-date">

                            {{
                                new Date(
                                    order.createdAt
                                ).toLocaleString()
                            }}

                        </span>

                    </div>

                </div>


                <div class="details">


                    <div class="detail">

                        <span class="detail-icon">

                            👤

                        </span>

                        <div>

                            <small>

                                Customer

                            </small>

                            <p>

                                {{ order.user.firstName }}

                                {{ order.user.lastName }}

                            </p>

                        </div>

                    </div>



                    <div class="detail">

                        <span class="detail-icon">

                            📞

                        </span>

                        <div>

                            <small>

                                Phone

                            </small>

                            <p>

                                {{ order.user.phone }}

                            </p>

                        </div>

                    </div>



                    <div class="detail">

                        <span class="detail-icon">

                            🍔

                        </span>

                        <div>

                            <small>

                                Items

                            </small>

                            <p>

                                {{ order.orderItems.length }}

                                Foods

                            </p>

                        </div>

                    </div>


                </div>


                <div class="price">

                    <span>

                        Total

                    </span>

                    <strong>

                        💰

                        {{
                            Number(
                                order.finalPrice
                            ).toLocaleString()
                        }}

                        تومان

                    </strong>

                </div>


            </div>



            <!-- ========================= -->
            <!-- RIGHT SIDE -->
            <!-- ========================= -->

            <div class="right">


                <!-- CURRENT STATUS -->

                <div
                    class="status-badge"
                    :class="
                        statusClass(order.status)
                    "
                >

                    <span>

                        {{ statusIcon(order.status) }}

                    </span>

                    {{ statusLabel(order.status) }}

                </div>



                <!-- CHANGE STATUS -->

                <div class="status-control">

                    <label>

                        Change Status

                    </label>


                    <select
                        v-model="order.status"
                        class="status-select"
                        :class="
                            statusClass(order.status)
                        "
                    >

                        <option
                            v-for="status in statuses"
                            :key="status"
                            :value="status"
                        >

                            {{ statusIcon(status) }}

                            {{ statusLabel(status) }}

                        </option>

                    </select>

                </div>



                <!-- BUTTONS -->

                <div class="buttons">


                    <button
                        class="details-btn"
                        @click="
                            openDetails(order)
                        "
                    >

                        👁 Details

                    </button>


                    <button
                        class="change-btn"
                        @click="
                            changeStatus(order)
                        "
                    >

                        💾 Update

                    </button>


                </div>


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


/* ========================= */
/* CONTAINER */
/* ========================= */

.container{

    max-width:1100px;

    margin:40px auto;

}



/* ========================= */
/* HEADER */
/* ========================= */

.header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}


.header h1{

    margin:0;

    font-size:28px;

}


.header p{

    color:#666;

    margin-top:8px;

}


.count{

    display:inline-flex;

    align-items:center;

    justify-content:center;

    min-width:30px;

    height:30px;

    padding:0 8px;

    margin-left:8px;

    border-radius:20px;

    background:#e8f8f1;

    color:#42b883;

    font-size:15px;

}



/* ========================= */
/* REFRESH */
/* ========================= */

.refresh-btn{

    border:none;

    padding:11px 18px;

    border-radius:10px;

    background:#42b883;

    color:white;

    cursor:pointer;

    font-weight:bold;

    transition:.2s;

}


.refresh-btn:hover{

    background:#369f74;

    transform:translateY(-2px);

}



/* ========================= */
/* ORDERS */
/* ========================= */

.orders{

    display:flex;

    flex-direction:column;

    gap:18px;

}



/* ========================= */
/* CARD */
/* ========================= */

.card{

    background:white;

    border-radius:18px;

    padding:24px;

    display:flex;

    justify-content:space-between;

    gap:30px;

    box-shadow:

        0 2px 10px rgba(0,0,0,.06);

    border:1px solid #f0f0f0;

    transition:.2s;

}


.card:hover{

    transform:translateY(-3px);

    box-shadow:

        0 10px 25px rgba(0,0,0,.10);

}



/* ========================= */
/* INFO */
/* ========================= */

.info{

    flex:1;

}


.order-title{

    display:flex;

    align-items:center;

    gap:14px;

    margin-bottom:22px;

}


.order-icon{

    width:48px;

    height:48px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:12px;

    background:#f1f8f5;

    font-size:25px;

}


.order-title h2{

    margin:0 0 5px;

    font-size:19px;

}


.order-date{

    color:#999;

    font-size:13px;

}



/* ========================= */
/* DETAILS */
/* ========================= */

.details{

    display:flex;

    flex-wrap:wrap;

    gap:25px;

    margin-bottom:20px;

}


.detail{

    display:flex;

    align-items:center;

    gap:9px;

}


.detail-icon{

    font-size:20px;

}


.detail small{

    display:block;

    color:#999;

    font-size:11px;

    margin-bottom:3px;

}


.detail p{

    margin:0;

    color:#444;

    font-size:14px;

}



/* ========================= */
/* PRICE */
/* ========================= */

.price{

    display:flex;

    align-items:center;

    gap:15px;

    padding-top:15px;

    border-top:1px solid #eee;

}


.price span{

    color:#888;

    font-size:14px;

}


.price strong{

    color:#42b883;

    font-size:18px;

}



/* ========================= */
/* RIGHT */
/* ========================= */

.right{

    width:220px;

    display:flex;

    flex-direction:column;

    gap:14px;

    align-items:stretch;

}



/* ========================= */
/* STATUS BADGE */
/* ========================= */

.status-badge{

    display:flex;

    align-items:center;

    justify-content:center;

    gap:7px;

    padding:10px 15px;

    border-radius:25px;

    font-weight:bold;

    font-size:14px;

}



/* Pending */

.status-badge.pending{

    background:#fff7ed;

    color:#c2410c;

}


/* Accepted */

.status-badge.accepted{

    background:#ecfdf5;

    color:#047857;

}


/* Preparing */

.status-badge.preparing{

    background:#eff6ff;

    color:#1d4ed8;

}


/* Ready */

.status-badge.ready{

    background:#f5f3ff;

    color:#6d28d9;

}


/* Cancelled */

.status-badge.cancelled{

    background:#fef2f2;

    color:#dc2626;

}


.status-badge.unknown{

    background:#f3f4f6;

    color:#4b5563;

}



/* ========================= */
/* STATUS CONTROL */
/* ========================= */

.status-control{

    display:flex;

    flex-direction:column;

    gap:6px;

}


.status-control label{

    color:#888;

    font-size:12px;

    font-weight:bold;

}


.status-select{

    width:100%;

    padding:11px 12px;

    border-radius:10px;

    border:1px solid #ddd;

    background:white;

    font-size:14px;

    cursor:pointer;

    outline:none;

    transition:.2s;

}


.status-select:focus{

    border-color:#42b883;

    box-shadow:

        0 0 0 3px rgba(66,184,131,.12);

}



/* ========================= */
/* BUTTONS */
/* ========================= */

.buttons{

    display:flex;

    gap:8px;

}


.details-btn,
.change-btn{

    flex:1;

    border:none;

    padding:10px 12px;

    border-radius:9px;

    color:white;

    cursor:pointer;

    font-weight:bold;

    transition:.2s;

}


.details-btn{

    background:#6b7280;

}


.details-btn:hover{

    background:#4b5563;

}


.change-btn{

    background:#42b883;

}


.change-btn:hover{

    background:#369f74;

}



/* ========================= */
/* EMPTY */
/* ========================= */

.empty{

    background:white;

    border-radius:18px;

    padding:80px 30px;

    text-align:center;

    box-shadow:

        0 2px 10px rgba(0,0,0,.06);

}


.empty-icon{

    font-size:60px;

    margin-bottom:15px;

}


.empty h2{

    margin-bottom:8px;

}


.empty p{

    color:#888;

}



/* ========================= */
/* LOADING */
/* ========================= */

.loading{

    background:white;

    border-radius:18px;

    padding:70px;

    text-align:center;

    color:#777;

}


.loading-icon{

    font-size:45px;

    margin-bottom:12px;

}



/* ========================= */
/* ERROR */
/* ========================= */

.error{

    display:flex;

    align-items:center;

    gap:10px;

    color:#b91c1c;

    background:#fef2f2;

    padding:18px;

    border-radius:12px;

}



/* ========================= */
/* RESPONSIVE */
/* ========================= */

@media(max-width:800px){

    .card{

        flex-direction:column;

    }


    .right{

        width:100%;

    }


    .buttons{

        width:100%;

    }

}


@media(max-width:600px){

    .container{

        margin:20px;

    }


    .header{

        align-items:flex-start;

        gap:15px;

        flex-direction:column;

    }


    .details{

        flex-direction:column;

        gap:14px;

    }


    .buttons{

        flex-direction:column;

    }

}

</style>