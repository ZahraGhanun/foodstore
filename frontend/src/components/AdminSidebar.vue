<script setup>

defineProps({
    activeTab: {
        type: String,
        required: true
    }
});

const emit = defineEmits(["change"]);

function changeTab(tab) {

    emit("change", tab);

}

</script>


<template>

<aside class="sidebar">

    <h2>
        👑 Admin Dashboard
    </h2>


    <button
        :class="{ active: activeTab === 'requests' }"
        @click="changeTab('requests')"
    >
        🏪 Restaurant Requests
    </button>


    <button
        :class="{ active: activeTab === 'restaurants' }"
        @click="changeTab('restaurants')"
    >
        🏬 Restaurants
    </button>


    <button
        :class="{ active: activeTab === 'users' }"
        @click="changeTab('users')"
    >
        👥 Users
    </button>


    <button
        :class="{ active: activeTab === 'drivers' }"
        @click="changeTab('drivers')"
    >
        🚗 Driver Requests
    </button>


    <button
        :class="{ active: activeTab === 'overview' }"
        @click="changeTab('overview')"
    >
        📊 Overview
    </button>

</aside>

</template>


<style scoped>

.sidebar {

    width: 260px;

    background: #ffffff;

    border-right: 1px solid #e5e5e5;

    padding: 24px;

    display: flex;

    flex-direction: column;

    gap: 12px;

}

.sidebar h2 {

    margin: 0 0 20px 0;

    color: #42b883;

}

.sidebar button {

    padding: 13px;

    border: none;

    border-radius: 9px;

    background: #f5f5f5;

    cursor: pointer;

    text-align: left;

    font-size: 15px;

    transition: .2s;

}

.sidebar button:hover {

    background: #42b88322;

}

.sidebar button.active {

    background: #42b883;

    color: white;

}

@media(max-width:900px) {

    .sidebar {

        width: 210px;

    }

}

@media(max-width:650px) {

    .sidebar {

        width: auto;

        border-right: none;

        border-bottom: 1px solid #e5e5e5;

    }

}

</style>