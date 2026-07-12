<script setup>

import { ref } from "vue";

import DriverAvailableOrdersView
    from "./DriverAvailableOrdersView.vue";

import DriverMyDeliveriesView
    from "./DriverMyDeliveriesView.vue";

const activeTab = ref("available");

</script>

<template>

<div class="container">

    <aside class="sidebar">

        <h2>

            🚗 Driver Dashboard

        </h2>

        <button

            :class="{ active: activeTab==='available' }"

            @click="activeTab='available'"

        >

            🚗 Available Orders

        </button>

        <button

            :class="{ active: activeTab==='deliveries' }"

            @click="activeTab='deliveries'"

        >

            🚚 My Deliveries

        </button>

        <button

            :class="{ active: activeTab==='earnings' }"

            @click="activeTab='earnings'"

        >

            📊 Earnings

        </button>


    </aside>

    <section class="content">

        <DriverAvailableOrdersView

            v-if="activeTab==='available'"

        />

        <DriverMyDeliveriesView

            v-else-if="activeTab==='deliveries'"

        />

        <div v-else>

            <h1>📊 Earnings</h1>

            <p>

                Coming Soon...

            </p>

        </div>


    </section>

</div>

</template>

<style scoped>

.container{

    display:flex;

    min-height:calc(100vh - 80px);

}

.sidebar{

    width:260px;

    background:#ffffff;

    border-right:1px solid #e5e5e5;

    padding:24px;

    display:flex;

    flex-direction:column;

    gap:12px;

}

.sidebar h2{

    margin-bottom:20px;

    color:#42b883;

}

.sidebar button{

    padding:12px;

    border:none;

    border-radius:8px;

    background:#f5f5f5;

    cursor:pointer;

    text-align:left;

    font-size:15px;

    transition:.2s;

}

.sidebar button:hover{

    background:#42b88322;

}

.sidebar button.active{

    background:#42b883;

    color:white;

}

.content{

    flex:1;

    padding:30px;

    overflow:auto;

}

</style>
