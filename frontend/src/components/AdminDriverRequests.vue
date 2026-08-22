<script setup>

import { ref, onMounted } from "vue";

import {
    getPendingDriverRequests,
    reviewDriverRequest
} from "../services/driver-registration.service.js";

import { token } from "../stores/auth.js";


const requests = ref([]);

const loading = ref(false);

const error = ref("");


// ==============================
// Load Driver Requests
// ==============================

async function loadRequests() {

    loading.value = true;

    error.value = "";

    try {

        const response =
            await getPendingDriverRequests(
                token.value
            );

        requests.value =
            response.data;

    }

    catch (err) {

        error.value =
            err.message ||
            "Failed to load driver requests.";

    }

    finally {

        loading.value = false;

    }

}


// ==============================
// Approve Request
// ==============================

async function approveRequest(request) {

    const confirmed = confirm(
        `Approve driver request for "${request.applicant.firstName} ${request.applicant.lastName}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await reviewDriverRequest(

            request.id,

            "APPROVED",

            "Driver approved successfully.",

            token.value

        );

        alert(
            "Driver approved successfully."
        );

        await loadRequests();

    }

    catch (err) {

        alert(
            err.message ||
            "Failed to approve driver."
        );

    }

}


// ==============================
// Reject Request
// ==============================

async function rejectRequest(request) {

    const confirmed = confirm(
        `Reject driver request for "${request.applicant.firstName} ${request.applicant.lastName}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await reviewDriverRequest(

            request.id,

            "REJECTED",

            "Driver registration rejected.",

            token.value

        );

        alert(
            "Driver request rejected."
        );

        await loadRequests();

    }

    catch (err) {

        alert(
            err.message ||
            "Failed to reject driver."
        );

    }

}


// ==============================
// Initial Load
// ==============================

onMounted(() => {

    loadRequests();

});

</script>


<template>

<div>

    <div class="header">

        <div>

            <h1>
                🚗 Driver Requests
            </h1>

            <p>
                Review driver registration requests.
            </p>

        </div>


        <button
            class="refresh-btn"
            @click="loadRequests"
        >

            🔄 Refresh

        </button>

    </div>


    <!-- LOADING -->

    <div
        v-if="loading"
        class="placeholder"
    >

        Loading driver requests...

    </div>


    <!-- ERROR -->

    <div
        v-else-if="error"
        class="error-box"
    >

        ❌ {{ error }}

    </div>


    <!-- EMPTY -->

    <div
        v-else-if="requests.length === 0"
        class="placeholder"
    >

        <h2>
            🎉 No Pending Driver Requests
        </h2>

        <p>
            There are currently no driver
            registration requests waiting for review.
        </p>

    </div>


    <!-- REQUESTS -->

    <div
        v-else
        class="requests"
    >

        <div
            v-for="request in requests"
            :key="request.id"
            class="request-card"
        >

            <!-- DRIVER INFO -->

            <div class="request-info">

                <h2>

                    🚗

                    {{ request.applicant.firstName }}

                    {{ request.applicant.lastName }}

                </h2>


                <div class="info-row">

                    📞

                    <strong>
                        Phone:
                    </strong>

                    {{ request.applicant.phone }}

                </div>


                <div class="info-row">

                    📧

                    <strong>
                        Email:
                    </strong>

                    {{ request.applicant.email || "-" }}

                </div>


                <div class="info-row">

                    🚘

                    <strong>
                        Vehicle:
                    </strong>

                    {{ request.vehicleType }}

                </div>


                <div class="info-row">

                    🔢

                    <strong>
                        License Plate:
                    </strong>

                    {{ request.licensePlate }}

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


            <!-- ACTIONS -->

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


.refresh-btn:hover {

    background: #369f74;

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
        rgba(0, 0, 0, .08);

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


.approve-btn:hover {

    background: #369f74;

}


.reject-btn {

    background: #f1f1f1;

    color: #d33;

}


.reject-btn:hover {

    background: #ffe5e5;

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
        rgba(0, 0, 0, .08);

}


.placeholder p {

    color: #666;

}


@media (max-width: 700px) {

    .request-card {

        flex-direction: column;

    }


    .actions {

        flex-direction: row;

    }

}

</style>