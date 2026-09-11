<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { createDriverRequest } from "../services/driver-registration.service.js";

const router = useRouter();

const isLoggedIn = !!localStorage.getItem("token");

const form = ref({
    vehicleType: "",
    licensePlate: ""
});

const loading = ref(false);
const error = ref("");
const success = ref("");

async function submitDriverRequest() {

    loading.value = true;
    error.value = "";
    success.value = "";

    try {

        const token = localStorage.getItem("token");

        await createDriverRequest(
            form.value,
            token
        );

        success.value =
            "Driver registration request submitted successfully.";

        form.value = {
            vehicleType: "",
            licensePlate: ""
        };

    } catch (err) {

        error.value = err.message;

    } finally {

        loading.value = false;

    }

}
</script>

<template>

    <div class="container">

        <!-- Login Warning -->
        <div
            v-if="!isLoggedIn"
            class="login-warning"
        >
            You must be logged in to complete the driver registration form.

            <RouterLink to="/login">
                Login
            </RouterLink>
        </div>


        <h1>Register as Driver</h1>

        <p class="description">
            Submit your information to become a FoodStore driver.
        </p>


        <!-- Registration Form -->
        <form
            v-if="isLoggedIn"
            @submit.prevent="submitDriverRequest"
        >

            <label>
                Vehicle Type
            </label>

            <select v-model="form.vehicleType">

                <option value="">
                    Select vehicle
                </option>

                <option value="MOTORCYCLE">
                    Motorcycle
                </option>

                <option value="CAR">
                    Car
                </option>

            </select>


            <label>
                License Plate
            </label>

            <input
                v-model="form.licensePlate"
                placeholder="Enter license plate"
            />


            <button
                type="submit"
                :disabled="loading"
            >
                {{ loading ? "Submitting..." : "Submit Request" }}
            </button>


            <p
                v-if="success"
                class="success"
            >
                {{ success }}
            </p>


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

.container {
    max-width: 450px;
    margin: 60px auto;
}


/* Login Warning */

.login-warning {
    padding: 14px 18px;
    margin-bottom: 25px;
    background: #fff3cd;
    border: 1px solid #ffe69c;
    border-radius: 8px;
    color: #664d03;
    font-weight: 500;
}

.login-warning a {
    margin-left: 6px;
    color: #42b883;
    font-weight: 700;
    text-decoration: none;
}

.login-warning a:hover {
    text-decoration: underline;
}


.description {
    color: #666;
    margin-bottom: 25px;
}


form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}


label {
    font-weight: 600;
}


input,
select {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;
}


button {
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: #42b883;
    color: white;
    cursor: pointer;
    font-size: 15px;
}


button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}


.success {
    color: green;
}


.error {
    color: red;
}

</style>