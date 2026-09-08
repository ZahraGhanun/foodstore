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

        console.error(err);

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

<div class="page">

    <!-- =========================
         Header
    ========================== -->

    <section class="page-header">

        <div>

            <h1>
                📦 My Orders
            </h1>

            <p>
                View and track all your orders.
            </p>

        </div>


        <div class="order-count">

            <strong>
                {{ orders.length }}
            </strong>

            <span>
                Orders
            </span>

        </div>

    </section>


    <!-- =========================
         Loading
    ========================== -->

    <div
        v-if="loading"
        class="message"
    >

        <div class="message-icon">
            ⏳
        </div>

        <h3>
            Loading your orders...
        </h3>

        <p>
            Please wait a moment.
        </p>

    </div>


    <!-- =========================
         Error
    ========================== -->

    <div
        v-else-if="error"
        class="message error-message"
    >

        <div class="message-icon">
            ❌
        </div>

        <h3>
            Failed to load orders
        </h3>

        <p>
            {{ error }}
        </p>

    </div>


    <!-- =========================
         Empty
    ========================== -->

    <div
        v-else-if="orders.length === 0"
        class="message empty-message"
    >

        <div class="message-icon">
            🛍️
        </div>

        <h2>
            No Orders Yet
        </h2>

        <p>
            You haven't placed any orders yet.
        </p>

        <RouterLink
            to="/"
            class="browse-btn"
        >
            🍕 Browse Restaurants
        </RouterLink>

    </div>


    <!-- =========================
         Orders
    ========================== -->

    <div
        v-else
        class="orders"
    >

        <article
            v-for="order in orders"
            :key="order.id"
            class="order-card"
        >

            <!-- =========================
                 Card Header
            ========================== -->

            <div class="card-header">

                <div class="order-info">

                    <h2>
                        📦 Order #{{ order.id.slice(0, 8) }}
                    </h2>

                    <p>
                        📅
                        {{ new Date(order.createdAt).toLocaleString() }}
                    </p>

                </div>


                <!-- Status -->

                <div
                    class="status"
                    :class="statusClass(order.status)"
                >

                    <span class="status-icon">
                        {{ statusIcon(order.status) }}
                    </span>

                    <span>
                        {{ statusText(order.status) }}
                    </span>

                </div>

            </div>


            <div class="divider"></div>


            <!-- =========================
                 Card Bottom
            ========================== -->

            <div class="card-footer">

                <div class="total">

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

        </article>

    </div>

</div>

</template>


<style scoped>

/* =========================
   Page
========================= */

.page {

    width: 100%;

    max-width: 1200px;

    margin: 0 auto;

    padding: 45px 35px 70px;

    box-sizing: border-box;

}


/* =========================
   Header
========================= */

.page-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-bottom: 35px;

}


.page-header h1 {

    margin: 0;

    font-size: 32px;

    color: #222;

}


.page-header p {

    margin: 8px 0 0;

    color: #777;

    font-size: 16px;

}


/* =========================
   Order Count
========================= */

.order-count {

    display: flex;

    align-items: center;

    gap: 7px;

    background: #e8f8f1;

    color: #42b883;

    padding: 10px 18px;

    border-radius: 25px;

    font-size: 15px;

}


.order-count strong {

    font-size: 20px;

}


/* =========================
   Orders
========================= */

.orders {

    display: flex;

    flex-direction: column;

    gap: 20px;

}


/* =========================
   Order Card
========================= */

.order-card {

    background: white;

    border-radius: 18px;

    padding: 25px 28px;

    box-shadow: 0 3px 14px rgba(0, 0, 0, .08);

    transition: .2s;

}


.order-card:hover {

    transform: translateY(-2px);

    box-shadow: 0 8px 24px rgba(0, 0, 0, .11);

}


/* =========================
   Card Header
========================= */

.card-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 25px;

}


.order-info h2 {

    margin: 0 0 8px;

    font-size: 19px;

    color: #222;

}


.order-info p {

    margin: 0;

    color: #888;

    font-size: 14px;

}


/* =========================
   Status
========================= */

.status {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;

    min-width: 190px;

    padding: 11px 18px;

    border-radius: 30px;

    font-size: 15px;

    font-weight: 700;

    white-space: nowrap;

}


.status-icon {

    font-size: 18px;

}


/* =========================
   Status Colors
========================= */

.status.pending {

    background: #fff4d6;

    color: #b77900;

}


.status.accepted {

    background: #dcfce7;

    color: #15803d;

}


.status.preparing {

    background: #dbeafe;

    color: #1d4ed8;

}


.status.ready {

    background: #ede9fe;

    color: #6d28d9;

}


.status.on-the-way {

    background: #dff7ec;

    color: #087443;

}


.status.delivered {

    background: #dcfce7;

    color: #15803d;

}


.status.cancelled {

    background: #fee2e2;

    color: #dc2626;

}


.status.default {

    background: #f3f4f6;

    color: #4b5563;

}


/* =========================
   Divider
========================= */

.divider {

    height: 1px;

    background: #eeeeee;

    margin: 22px 0;

}


/* =========================
   Footer
========================= */

.card-footer {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 20px;

}


/* =========================
   Total
========================= */

.total {

    display: flex;

    flex-direction: column;

    gap: 5px;

}


.total > span {

    color: #888;

    font-size: 13px;

}


.total strong {

    color: #42b883;

    font-size: 22px;

}


.total small {

    font-size: 12px;

    font-weight: normal;

}


/* =========================
   Details Button
========================= */

.details-btn {

    padding: 12px 22px;

    border: none;

    border-radius: 10px;

    background: #42b883;

    color: white;

    cursor: pointer;

    font-size: 15px;

    font-weight: bold;

    transition: .2s;

}


.details-btn:hover {

    background: #369f74;

    transform: translateY(-1px);

}


/* =========================
   Messages
========================= */

.message {

    background: white;

    border-radius: 18px;

    padding: 70px 30px;

    text-align: center;

    box-shadow: 0 3px 14px rgba(0, 0, 0, .07);

}


.message-icon {

    font-size: 55px;

    margin-bottom: 15px;

}


.message h2,
.message h3 {

    margin: 0 0 10px;

    color: #333;

}


.message p {

    margin: 0 0 25px;

    color: #888;

}


.error-message {

    color: #dc2626;

}


.error-message h3 {

    color: #dc2626;

}


/* =========================
   Browse Button
========================= */

.browse-btn {

    display: inline-block;

    padding: 12px 22px;

    border-radius: 10px;

    background: #42b883;

    color: white;

    text-decoration: none;

    font-weight: bold;

    transition: .2s;

}


.browse-btn:hover {

    background: #369f74;

}


/* =========================
   Mobile
========================= */

@media (max-width: 700px) {

    .page {

        padding: 30px 18px 50px;

    }


    .page-header {

        align-items: flex-start;

        gap: 15px;

    }


    .page-header h1 {

        font-size: 26px;

    }


    .order-count {

        padding: 8px 13px;

        font-size: 13px;

    }


    .card-header {

        flex-direction: column;

        align-items: flex-start;

    }


    .status {

        width: 100%;

        box-sizing: border-box;

    }


    .card-footer {

        flex-direction: column;

        align-items: stretch;

    }


    .details-btn {

        width: 100%;

    }

}

</style>