<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { register } from "../services/auth.service.js";

const router = useRouter();

const form = ref({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: ""
});

const loading = ref(false);
const error = ref("");

async function submitRegister() {

  loading.value = true;
  error.value = "";

  try {

    await register(form.value);

    alert("Registration successful.");

    router.push("/login");

  } catch (err) {

    error.value = err.message;

  } finally {

    loading.value = false;

  }

}
</script>

<template>

  <div class="container">

    <h1>Create Account</h1>

    <form @submit.prevent="submitRegister">

      <input
        v-model="form.firstName"
        placeholder="First Name"
      />

      <input
        v-model="form.lastName"
        placeholder="Last Name"
      />

      <input
        v-model="form.phone"
        placeholder="Phone"
      />

      <input
        v-model="form.email"
        placeholder="Email"
      />

      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
      />

      <button
        type="submit"
        :disabled="loading"
      >
        {{ loading ? "Registering..." : "Register" }}
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

button:disabled{
    opacity:.6;
}

.error{
    color:red;
}

</style>