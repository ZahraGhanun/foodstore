<script setup>
import { ref } from "vue";

import { createAddress } from "../services/delivery-address.service.js";

const emit = defineEmits([
  "created",
  "cancel"
]);

const form = ref({

  title:"",
  receiverName:"",
  receiverPhone:"",
  address:""

});

const loading = ref(false);

const error = ref("");

async function submit(){

  loading.value=true;

  error.value="";

  try{

    await createAddress(form.value);

    form.value={

      title:"",
      receiverName:"",
      receiverPhone:"",
      address:""

    };

    emit("created");

  }

  catch(err){

    error.value=err.message;

  }

  finally{

    loading.value=false;

  }

}

</script>

<template>

<div class="card">

<h3>Add New Address</h3>

<form @submit.prevent="submit">

<input
v-model="form.title"
placeholder="Title (Home, Office...)"
/>

<input
v-model="form.receiverName"
placeholder="Receiver Name"
/>

<input
v-model="form.receiverPhone"
placeholder="Receiver Phone"
/>

<textarea
v-model="form.address"
placeholder="Full Address"
/>

<div class="buttons">

<button
type="submit"
:disabled="loading"
>

{{ loading ? "Saving..." : "Save Address" }}

</button>

<button
type="button"
class="cancel"
@click="$emit('cancel')"
>

Cancel

</button>

</div>

<p
v-if="error"
class="error"
>

{{ error }}

</p>

</form>

</div>

</template>

<style scoped>

.card{

border:1px solid #ddd;

border-radius:12px;

padding:18px;

margin-bottom:20px;

background:white;

}

form{

display:flex;

flex-direction:column;

gap:14px;

}

input,
textarea{

padding:12px;

border:1px solid #ddd;

border-radius:8px;

font-size:15px;

width:100%;

box-sizing:border-box;

}

textarea{

min-height:110px;

resize:vertical;

}

.buttons{

display:flex;

gap:10px;

margin-top:10px;

}

button{

padding:10px 16px;

border:none;

border-radius:8px;

cursor:pointer;

background:#42b883;

color:white;

}

.cancel{

background:#777;

}

.error{

margin-top:10px;

color:#ef4444;

}

</style>