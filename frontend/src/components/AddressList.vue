<script setup>
import { ref, onMounted } from "vue";

import AddressForm from "./AddressForm.vue";

import {
  getAddresses,
  deleteAddress,
  setDefaultAddress
} from "../services/delivery-address.service.js";

const addresses = ref([]);

const loading = ref(true);

const error = ref("");

const showForm = ref(false);

async function loadAddresses() {

  loading.value = true;

  error.value = "";

  try {

    const response = await getAddresses();

    addresses.value = response.data;

  }

  catch (err) {

    error.value = err.message;

  }

  finally {

    loading.value = false;

  }

}

function addressCreated() {

  showForm.value = false;

  loadAddresses();

}

function closeForm() {

  showForm.value = false;

}

async function removeAddress(id) {

  if (!confirm("Delete this address?")) return;

  try {

    await deleteAddress(id);

    loadAddresses();

  }

  catch (err) {

    alert(err.message);

  }

}

async function makeDefault(id) {

  try {

    await setDefaultAddress(id);

    loadAddresses();

  }

  catch (err) {

    alert(err.message);

  }

}

onMounted(loadAddresses);

</script>

<template>

<div>

<div class="header">

<h2>Your Addresses</h2>

<button

v-if="!showForm"

class="add-btn"

@click="showForm = true"

>

＋ Add New Address

</button>

</div>

<AddressForm

v-if="showForm"

@created="addressCreated"

@cancel="closeForm"

/>

<div v-if="loading">

Loading...

</div>

<div v-else-if="error">

{{ error }}

</div>

<div v-else>

<div
v-if="addresses.length===0"
>

No address found.

</div>

<div

v-for="address in addresses"

:key="address.id"

class="card"

>

<h3>

{{ address.title }}

<span v-if="address.isDefault">

⭐ Default

</span>

</h3>

<p>

<strong>Receiver:</strong>

{{ address.receiverName }}

</p>

<p>

<strong>Phone:</strong>

{{ address.receiverPhone }}

</p>

<p>

<strong>Address:</strong>

{{ address.address }}

</p>

<div class="actions">

<button

v-if="!address.isDefault"

@click="makeDefault(address.id)"

>

Set Default

</button>

<button

@click="removeAddress(address.id)"

class="delete"

>

Delete

</button>

</div>

</div>

</div>

</div>

</template>

<style scoped>

.header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:20px;

}

.card{

border:1px solid #ddd;

border-radius:12px;

padding:18px;

margin-bottom:20px;

background:white;

}

.actions{

display:flex;

gap:10px;

margin-top:15px;

}

button{

padding:10px 16px;

border:none;

border-radius:8px;

cursor:pointer;

background:#42b883;

color:white;

}

.delete{

background:#d11a1a;

}

.add-btn{

padding:9px 18px;

font-size:14px;

font-weight:600;

background:#42b883;

border-radius:8px;

transition:.2s;

}

.add-btn:hover{

background:#369f74;

}

</style>