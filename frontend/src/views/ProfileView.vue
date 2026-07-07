<script setup>
import { ref, reactive, onMounted } from "vue";

import AddressList from "../components/AddressList.vue";
import OrdersList from "../components/OrdersList.vue";

import {
  getProfile,
  updateProfile
} from "../services/auth.service.js";

const activeTab = ref("profile");

const loading = ref(true);

const editing = ref(false);

const profile = reactive({

  firstName: "",
  lastName: "",
  phone: "",
  email: ""

});

async function loadProfile() {

  try {

    const response = await getProfile();

    profile.firstName = response.data.firstName;
    profile.lastName = response.data.lastName;
    profile.phone = response.data.phone;
    profile.email = response.data.email || "";

  }

  catch (err) {

    alert(err.message);

  }

  finally {

    loading.value = false;

  }

}

onMounted(loadProfile);

async function saveProfile() {

  try {

    await updateProfile({

      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email

    });

    editing.value = false;

    alert("Profile updated successfully.");

  }

  catch (err) {

    alert(err.message);

  }

}

function cancelEdit() {

  editing.value = false;

  loadProfile();

}
</script>

<template>

<div class="container">

<aside class="sidebar">

<button

:class="{active:activeTab==='profile'}"

@click="activeTab='profile'"

>

👤 Personal Information

</button>

<button

:class="{active:activeTab==='addresses'}"

@click="activeTab='addresses'"

>

📍 Delivery Addresses

</button>

<button

:class="{active:activeTab==='orders'}"

@click="activeTab='orders'"

>

📦 My Orders

</button>

<button

:class="{active:activeTab==='password'}"

@click="activeTab='password'"

>

🔒 Change Password

</button>

</aside>

<section class="content">

<!-- PROFILE -->

<div v-if="activeTab==='profile'">

<h1>Personal Information</h1>

<div v-if="loading">

Loading...

</div>

<div v-else>

<div class="field">

<label>

First Name

</label>

<input

v-if="editing"

v-model="profile.firstName"

/>

<p v-else>

{{ profile.firstName }}

</p>

</div>

<div class="field">

<label>

Last Name

</label>

<input

v-if="editing"

v-model="profile.lastName"

/>

<p v-else>

{{ profile.lastName }}

</p>

</div>

<div class="field">

<label>

Phone

</label>

<p>

{{ profile.phone }}

</p>

</div>

<div class="field">

<label>

Email

</label>

<input

v-if="editing"

v-model="profile.email"

/>

<p v-else>

{{ profile.email || "-" }}

</p>

</div>

<div class="buttons">

<button

v-if="!editing"

class="edit-btn"

@click="editing=true"

>

Edit Profile

</button>

<template v-else>

<button

class="save-btn"

@click="saveProfile"

>

Save

</button>

<button

class="cancel-btn"

@click="cancelEdit"

>

Cancel

</button>

</template>

</div>

</div>

</div>

<!-- ADDRESSES -->

<div v-if="activeTab==='addresses'">

<AddressList />

</div>

<!-- ORDERS -->

<div v-if="activeTab==='orders'">

<OrdersList />

</div>

<!-- PASSWORD -->

<div v-if="activeTab==='password'">

<h1>Change Password</h1>

<p>Coming Soon...</p>

</div>

</section>

</div>

</template>

<style scoped>

.container{

    max-width:1200px;
    margin:40px auto;
    display:flex;
    gap:30px;

}

.sidebar{

    width:260px;
    background:white;
    border-radius:14px;
    box-shadow:0 2px 10px rgba(0,0,0,.08);
    padding:20px;
    display:flex;
    flex-direction:column;
    gap:15px;

}

.sidebar button{

    padding:14px;
    border:none;
    border-radius:10px;
    cursor:pointer;
    background:#f5f5f5;
    text-align:left;
    font-size:15px;
    transition:.2s;

}

.sidebar button:hover{

    background:#ececec;

}

.sidebar button.active{

    background:#42b883;
    color:white;

}

.content{

    flex:1;
    background:white;
    border-radius:14px;
    box-shadow:0 2px 10px rgba(0,0,0,.08);
    padding:30px;

}

.field{

    margin-top:25px;

}

.field label{

    display:block;
    margin-bottom:8px;
    font-weight:bold;

}

.field input{

    width:100%;
    padding:12px;
    border:1px solid #ddd;
    border-radius:8px;
    font-size:15px;

}

.field p{

    padding:12px;
    background:#f8f8f8;
    border-radius:8px;

}

.buttons{

    margin-top:30px;
    display:flex;
    gap:15px;

}

.edit-btn,
.save-btn{

    padding:12px 20px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    background:#42b883;
    color:white;
    transition:.2s;

}

.edit-btn:hover,
.save-btn:hover{

    background:#369f74;

}

.cancel-btn{

    padding:12px 20px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    background:#999;
    color:white;
    transition:.2s;

}

.cancel-btn:hover{

    background:#777;

}

</style>