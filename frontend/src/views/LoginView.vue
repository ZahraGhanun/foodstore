<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { login } from "../services/auth.service.js";

import {

  user,

  token

} from "../stores/auth.js";

const router = useRouter();

const form = ref({

  phone: "",
  password: ""

});

const loading = ref(false);

const error = ref("");

async function submitLogin() {

  loading.value = true;

  error.value = "";

  try {

    const response = await login(form.value);

    // آپدیت Store
    token.value = response.data.token;

    user.value = response.data.user;

    // ذخیره در LocalStorage
    localStorage.setItem(

      "token",

      response.data.token

    );

    localStorage.setItem(

      "user",

      JSON.stringify(response.data.user)

    );

    router.push("/");

  }

  catch (err) {

    error.value = err.message;

  }

  finally {

    loading.value = false;

  }

}
</script>

<template>

  <div class="container">

    <h1>Login</h1>

    <form @submit.prevent="submitLogin">

      <input

        v-model="form.phone"

        placeholder="Phone (09xxxxxxxxx)"

      />

      <input

        v-model="form.password"

        type="password"

        placeholder="Password"

      />

      <button :disabled="loading">

        {{ loading ? "Logging in..." : "Login" }}

      </button>

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

.container{

    max-width:450px;

    margin:60px auto;

}

form{

    display:flex;

    flex-direction:column;

    gap:15px;

}

input{

    padding:12px;

    border:1px solid #ddd;

    border-radius:8px;

}

button{

    padding:12px;

    border:none;

    border-radius:8px;

    background:#42b883;

    color:white;

    cursor:pointer;

}

.error{

    color:red;

}

</style>