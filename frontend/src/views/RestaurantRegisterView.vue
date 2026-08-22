<script setup>
import { ref } from "vue";

import { createRequest } from "../services/restaurant-registration.service.js";

const form = ref({
    restaurantName: "",
    phone: "",
    address: "",
    description: ""
});

const loading = ref(false);
const error = ref("");
const success = ref("");

async function submitRestaurantRequest() {

    loading.value = true;
    error.value = "";
    success.value = "";

    try {

        await createRequest(form.value);

        success.value =
            "Restaurant registration request submitted successfully.";

        form.value = {
            restaurantName: "",
            phone: "",
            address: "",
            description: ""
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

        <h1>Register Your Restaurant</h1>

        <p class="description">
            Submit your restaurant information for admin approval.
        </p>

        <form @submit.prevent="submitRestaurantRequest">

            <label>
                Restaurant Name
            </label>

            <input
                v-model="form.restaurantName"
                type="text"
                placeholder="Restaurant name"
            />

            <label>
                Phone
            </label>

            <input
                v-model="form.phone"
                type="text"
                placeholder="09xxxxxxxxx"
            />

            <label>
                Address
            </label>

            <textarea
                v-model="form.address"
                placeholder="Restaurant address"
                rows="4"
            ></textarea>

            <label>
                Description
            </label>

            <textarea
                v-model="form.description"
                placeholder="Restaurant description (optional)"
                rows="3"
            ></textarea>

            <button
                type="submit"
                :disabled="loading"
            >
                {{
                    loading
                        ? "Submitting..."
                        : "Submit Request"
                }}
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
    max-width: 500px;
    margin: 60px auto;
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
textarea {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;
    font-family: inherit;
    resize: vertical;
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