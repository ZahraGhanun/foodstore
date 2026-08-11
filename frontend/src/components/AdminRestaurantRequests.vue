<script setup>

import { ref, onMounted } from "vue";

import {
    getPendingRequests,
    reviewRequest
} from "../services/restaurant-registration.service.js";


const requests = ref([]);

const loading = ref(false);

const error = ref("");


async function loadRequests() {

    loading.value = true;

    error.value = "";

    try {

        const response =
            await getPendingRequests();

        requests.value = response.data;

    }

    catch (err) {

        error.value =
            err.message ||
            "Failed to load restaurant requests.";

    }

    finally {

        loading.value = false;

    }

}


async function approveRequest(request) {

    const confirmed = confirm(
        `Approve "${request.restaurantName}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await reviewRequest(
            request.id,
            "APPROVED",
            "Restaurant approved successfully."
        );

        alert(
            "Restaurant approved successfully."
        );

        await loadRequests();

    }

    catch (err) {

        alert(
            err.message ||
            "Failed to approve restaurant."
        );

    }

}


async function rejectRequest(request) {

    const confirmed = confirm(
        `Reject "${request.restaurantName}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await reviewRequest(
            request.id,
            "REJECTED",
            "Restaurant registration rejected."
        );

        alert(
            "Restaurant request rejected."
        );

        await loadRequests();

    }

    catch (err) {

        alert(
            err.message ||
            "Failed to reject restaurant."
        );

    }

}


onMounted(loadRequests);

</script>


<template>

<div>

    <div class="header">

        <div>

            <h1>
                🏪 Restaurant Requests
            </h1>

            <p>
                Review restaurant registration requests.
            </p>

        </div>


        <button
            class="refresh-btn"
            @click="loadRequests"
        >
            🔄 Refresh
        </button>

    </div>


    <div
        v-if="loading"
        class="placeholder"
    >
        Loading restaurant requests...
    </div>


    <div
        v-else-if="error"
        class="error-box"
    >
        ❌ {{ error }}
    </div>


    <div
        v-else-if="requests.length === 0"
        class="placeholder"
    >

        <h2>
            🎉 No Pending Requests
        </h2>

        <p>
            There are currently no restaurant
            registration requests waiting for review.
        </p>

    </div>


    <div
        v-else
        class="requests"
    >

        <div
            v-for="request in requests"
            :key="request.id"
            class="request-card"
        >

            <div class="request-info">

                <h2>
                    🏪 {{ request.restaurantName }}
                </h2>


                <div class="info-row">

                    👤

                    <strong>
                        Applicant:
                    </strong>

                    {{ request.applicant.firstName }}
                    {{ request.applicant.lastName }}

                </div>


                <div class="info-row">

                    📞

                    <strong>
                        Phone:
                    </strong>

                    {{ request.phone }}

                </div>


                <div class="info-row">

                    📧

                    <strong>
                        Email:
                    </strong>

                    {{ request.applicant.email || "-" }}

                </div>


                <div class="info-row">

                    📍

                    <strong>
                        Address:
                    </strong>

                    {{ request.address }}

                </div>


                <div
                    v-if="request.description"
                    class="info-row"
                >

                    📝

                    <strong>
                        Description:
                    </strong>

                    {{ request.description }}

                </div>


                <div class="info-row">

                    🕒

                    <strong>
                        Submitted:
                    </strong>

                    {{
                        new Date(
                            request.createdAt
                        ).toLocaleString()
                    }}

                </div>

            </div>


            <div class="actions">

                <button
                    class="approve-btn"
                    @click="approveRequest(request)"
                >
                    ✅ Approve
                </button>


                <button
                    class="reject-btn"
                    @click="rejectRequest(request)"
                >
                    ❌ Reject
                </button>

            </div>

        </div>

    </div>

</div>

</template>


<style scoped>

.header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-bottom: 25px;

}

.header h1 {
    margin-top: 0;
}

.header p {
    color: #666;
}

.refresh-btn {

    background: #42b883;

    color: white;

    border: none;

    padding: 11px 18px;

    border-radius: 9px;

    cursor: pointer;

    font-weight: bold;

}

.requests {

    display: flex;

    flex-direction: column;

    gap: 20px;

}

.request-card {

    background: white;

    border-radius: 16px;

    padding: 24px;

    display: flex;

    justify-content: space-between;

    gap: 30px;

    box-shadow:
        0 2px 12px
        rgba(0,0,0,.08);

}

.request-info {

    line-height: 1.9;

    flex: 1;

}

.request-info h2 {

    margin-top: 0;

    margin-bottom: 18px;

}

.info-row {

    margin-bottom: 6px;

}

.actions {

    display: flex;

    flex-direction: column;

    justify-content: center;

    gap: 10px;

    min-width: 120px;

}

.approve-btn,
.reject-btn {

    border: none;

    padding: 12px 18px;

    border-radius: 9px;

    cursor: pointer;

    font-weight: bold;

}

.approve-btn {

    background: #42b883;

    color: white;

}

.reject-btn {

    background: #f1f1f1;

    color: #d33;

}

.error-box {

    margin-top: 30px;

    background: #ffecec;

    color: #c62828;

    padding: 20px;

    border-radius: 12px;

}

.placeholder {

    margin-top: 30px;

    background: white;

    padding: 40px;

    border-radius: 16px;

    box-shadow:
        0 2px 12px
        rgba(0,0,0,.08);

}

@media(max-width:900px) {

    .request-card {
        flex-direction: column;
    }

    .actions {
        flex-direction: row;
    }

}

</style>