<script setup>

import { ref, onMounted } from "vue";

import AddressCard from "../components/AddressCard.vue";

import {

    getAddresses,

    deleteAddress,

    setDefaultAddress

} from "../services/address.service.js";

const addresses = ref([]);

async function loadAddresses(){

    const response = await getAddresses();

    addresses.value = response.data;

}

onMounted(loadAddresses);

async function remove(id){

    await deleteAddress(id);

    await loadAddresses();

}

async function makeDefault(id){

    await setDefaultAddress(id);

    await loadAddresses();

}

</script>

<template>

<div class="container">

    <h1>My Addresses</h1>

    <div class="grid">

        <AddressCard

            v-for="address in addresses"

            :key="address.id"

            :address="address"

            @delete="remove"

            @default="makeDefault"

        />

    </div>

</div>

</template>

<style scoped>

.container{

    max-width:1000px;

    margin:40px auto;

}

.grid{

    display:grid;

    grid-template-columns:repeat(auto-fill,minmax(320px,1fr));

    gap:20px;

}

</style>