<script setup>

import { ref } from "vue";

import AdminSidebar
    from "../components/AdminSidebar.vue";

import AdminRestaurantRequests
    from "../components/AdminRestaurantRequests.vue";

import AdminRestaurants
    from "../components/AdminRestaurants.vue";

import AdminUsers
    from "../components/AdminUsers.vue";

import AdminDriverRequests
    from "../components/AdminDriverRequests.vue";

import AdminOverview
    from "../components/AdminOverview.vue";


const activeTab = ref("requests");

</script>


<template>

<div class="container">


    <AdminSidebar
        :active-tab="activeTab"
        @change="activeTab = $event"
    />


    <section class="content">


        <AdminRestaurantRequests
            v-if="activeTab === 'requests'"
        />


        <AdminRestaurants
            v-else-if="activeTab === 'restaurants'"
        />


        <AdminUsers
            v-else-if="activeTab === 'users'"
        />


        <AdminDriverRequests
            v-else-if="activeTab === 'drivers'"
        />


        <AdminOverview
            v-else-if="activeTab === 'overview'"
        />


    </section>

</div>

</template>


<style scoped>

.container {

    display: flex;

    min-height:
        calc(100vh - 80px);

}

.content {

    flex: 1;

    padding: 30px;

    overflow: auto;

}

.content :deep(h1) {

    margin-top: 0;

}

@media(max-width:650px) {

    .container {

        flex-direction: column;

    }

}

</style>