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


/* =========================
   Status Text
========================= */

function statusText(status) {

    switch (status) {

        case "PENDING":
            return "Pending";

        case "ACCEPTED":
            return "Accepted";

        case "PREPARING":
            return "Preparing";

        case "READY_FOR_PICKUP":
            return "Ready for Pickup";

        case "PICKED_UP":
            return "On the Way";

        case "ON_THE_WAY":
            return "On the Way";

        case "DELIVERED":
            return "Delivered";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status;

    }

}


/* =========================
   Status Icon
========================= */

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

        case "PICKED_UP":
            return "🚚";

        case "ON_THE_WAY":
            return "🚚";

        case "DELIVERED":
            return "🎉";

        case "CANCELLED":
            return "❌";

        default:
            return "📋";

    }

}


/* =========================
   Status Class
========================= */

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

        case "PICKED_UP":
            return "on-the-way";

        case "ON_THE_WAY":
            return "on-the-way";

        case "DELIVERED":
            return "delivered";

        case "CANCELLED":
            return "cancelled";

        default:
            return "default";

    }

}

</script>


<template>

<div class="orders-container">


    <!-- =========================
         Header
    ========================== -->

    <div class="orders-header">

        <div>

            <h2>

                📦 My Orders

            </h2>

            <p>

                View and track your previous orders.

            </p>

        </div>

        <span class="order-count">

            {{ orders.length }}

            Orders

        </span>

    </div>


    <!-- =========================
         Loading
    ========================== -->

    <div
        v-if="loading"
        class="message"
    >

        <span class="loading-icon">

            ⏳

        </span>

        Loading your orders...

    </div>


    <!-- =========================
         Error
    ========================== -->

    <div
        v-else-if="error"
        class="message error-message"
    >

        ❌ {{ error }}

    </div>


    <!-- =========================
         Empty
    ========================== -->

    <div
        v-else-if="orders.length === 0"
        class="empty"
    >

        <div class="empty-icon">

            🛍️

        </div>

        <h3>

            No Orders Yet

        </h3>

        <p>

            You haven't placed any orders yet.

        </p>

    </div>


    <!-- =========================
         Orders
    ========================== -->

    <div
        v-else
        class="orders"
    >

        <div
            v-for="order in orders"
            :key="order.id"
            class="card"
        >


            <!-- =========================
                 Top
            ========================== -->

            <div class="top">

                <div class="order-info">

                    <h3>

                        📦 Order #{{ order.id.slice(0,8) }}

                    </h3>

                    <p>

                        📅

                        {{ new Date(order.createdAt).toLocaleString() }}

                    </p>

                </div>


                <!-- =========================
                     STATUS
                ========================== -->

                <div
                    class="status"
                    :class="statusClass(order.status)"
                >

                    <span class="status-icon">

                        {{ statusIcon(order.status) }}

                    </span>

                    <span class="status-text">

                        {{ statusText(order.status) }}

                    </span>

                </div>

            </div>


            <!-- =========================
                 Divider
            ========================== -->

            <div class="divider"></div>


            <!-- =========================
                 Bottom
            ========================== -->

            <div class="bottom">


                <div class="price">

                    <span>

                        Total

                    </span>

                    <strong>

                        {{ Number(order.finalPrice).toLocaleString() }}

                        <small>

                            تومان

                        </small>

                    </strong>

                </div>


                <button
                    class="details-btn"
                    @click="openOrder(order.id)"
                >

                    👁

                    View Details

                </button>

            </div>

        </div>

    </div>

</div>

</template>


<style scoped>

/* =========================
   Container
========================= */

.orders-container{

    width:100%;

}


/* =========================
   Header
========================= */

.orders-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:25px;

}

.orders-header h2{

    margin:0;

    font-size:24px;

    color:#222;

}

.orders-header p{

    margin-top:7px;

    color:#777;

    font-size:14px;

}

.order-count{

    background:#e8f8f1;

    color:#42b883;

    padding:8px 14px;

    border-radius:20px;

    font-size:14px;

    font-weight:bold;

}


/* =========================
   Orders
========================= */

.orders{

    display:flex;

    flex-direction:column;

    gap:18px;

}


/* =========================
   Card
========================= */

.card{

    background:white;

    border-radius:16px;

    padding:22px;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

    transition:.2s;

}

.card:hover{

    transform:translateY(-2px);

    box-shadow:0 8px 22px rgba(0,0,0,.11);

}


/* =========================
   Top
========================= */

.top{

    display:flex;

    justify-content:space-between;

    align-items:center;

    gap:20px;

}

.order-info h3{

    margin:0 0 7px 0;

    font-size:17px;

    color:#222;

}

.order-info p{

    margin:0;

    color:#888;

    font-size:13px;

}


/* =========================
   STATUS
========================= */

.status{

    display:flex;

    align-items:center;

    justify-content:center;

    gap:8px;

    min-width:190px;

    padding:11px 18px;

    border-radius:30px;

    font-size:15px;

    font-weight:700;

    white-space:nowrap;

}

.status-icon{

    font-size:18px;

}

.status-text{

    font-size:15px;

}


/* =========================
   Pending
========================= */

.status.pending{

    background:#fff4d6;

    color:#b77900;

}


/* =========================
   Accepted
========================= */

.status.accepted{

    background:#dcfce7;

    color:#15803d;

}


/* =========================
   Preparing
========================= */

.status.preparing{

    background:#dbeafe;

    color:#1d4ed8;

}


/* =========================
   Ready For Pickup
========================= */

.status.ready{

    background:#ede9fe;

    color:#6d28d9;

}


/* =========================
   On The Way
========================= */

.status.on-the-way{

    background:#dff7ec;

    color:#087443;

}


/* =========================
   Delivered
========================= */

.status.delivered{

    background:#dcfce7;

    color:#15803d;

}


/* =========================
   Cancelled
========================= */

.status.cancelled{

    background:#fee2e2;

    color:#dc2626;

}


/* =========================
   Default
========================= */

.status.default{

    background:#f3f4f6;

    color:#4b5563;

}


/* =========================
   Divider
========================= */

.divider{

    height:1px;

    background:#eeeeee;

    margin:18px 0;

}


/* =========================
   Bottom
========================= */

.bottom{

    display:flex;

    justify-content:space-between;

    align-items:center;

}

.price{

    display:flex;

    flex-direction:column;

    gap:5px;

}

.price span{

    color:#888;

    font-size:13px;

}

.price strong{

    color:#42b883;

    font-size:20px;

}

.price small{

    font-size:12px;

    font-weight:normal;

}


/* =========================
   Details Button
========================= */

.details-btn{

    padding:11px 18px;

    border:none;

    border-radius:9px;

    background:#42b883;

    color:white;

    cursor:pointer;

    font-size:14px;

    font-weight:bold;

    transition:.2s;

}

.details-btn:hover{

    background:#369f74;

    transform:translateY(-1px);

}


/* =========================
   Empty
========================= */

.empty{

    background:#fff;

    border-radius:16px;

    padding:60px 20px;

    text-align:center;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.empty-icon{

    font-size:55px;

    margin-bottom:15px;

}

.empty h3{

    margin-bottom:8px;

    color:#333;

}

.empty p{

    color:#888;

}


/* =========================
   Messages
========================= */

.message{

    background:white;

    border-radius:16px;

    padding:40px;

    text-align:center;

    color:#777;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

}

.loading-icon{

    font-size:22px;

    margin-right:8px;

}

.error-message{

    color:#dc2626;

    background:#fff5f5;

}


/* =========================
   Mobile
========================= */

@media(max-width:650px){

    .orders-header{

        align-items:flex-start;

        gap:15px;

    }

    .top{

        flex-direction:column;

        align-items:flex-start;

    }

    .status{

        width:100%;

        box-sizing:border-box;

    }

    .bottom{

        flex-direction:column;

        align-items:stretch;

        gap:15px;

    }

    .details-btn{

        width:100%;

    }

}

</style>