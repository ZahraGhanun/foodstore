<script setup>

import {
    ref,
    onMounted,
    computed
} from "vue";

import {
    useRoute,
    useRouter
} from "vue-router";


import {
    getOrderById
} from "../services/order.service.js";


import {
    createReview,
    getMyReviews
} from "../services/review.service.js";


const route = useRoute();

const router = useRouter();


const order = ref(null);

const loading = ref(true);

const error = ref("");


/*
|--------------------------------------------------------------------------
| Review
|--------------------------------------------------------------------------
*/

const reviewsByItem = ref({});

const selectedRatings = ref({});

const comments = ref({});

const complaints = ref({});

const reviewLoading = ref({});

const reviewErrors = ref({});

const reviewSuccess = ref({});


/*
|--------------------------------------------------------------------------
| Load Order
|--------------------------------------------------------------------------
*/

onMounted(loadOrder);


async function loadOrder() {

    try {

        const response =
            await getOrderById(route.params.id);

        order.value = response.data;


        /*
         * اگر سفارش تحویل شده باشد،
         * Review های قبلی کاربر را هم می‌گیریم.
         */

        if (order.value.status === "DELIVERED") {

            await loadReviews();

        }

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}


/*
|--------------------------------------------------------------------------
| Load Reviews
|--------------------------------------------------------------------------
*/

async function loadReviews() {

    try {

        const response =
            await getMyReviews();


        const reviews =
            response.data || [];


        const map = {};


        reviews.forEach(review => {

            /*
             * فقط Review های همین سفارش
             */

            if (
                review.orderItem?.order?.id ===
                order.value.id
            ) {

                map[review.orderItemId] = review;

            }

        });


        reviewsByItem.value = map;

    }

    catch (err) {

        console.error(
            "Failed to load reviews:",
            err
        );

    }

}


/*
|--------------------------------------------------------------------------
| Order Calculations
|--------------------------------------------------------------------------
*/

const subtotal = computed(() => {

    if (!order.value) return 0;


    return order.value.orderItems.reduce(
        (sum, item) => {

            return (
                sum +
                Number(item.unitPrice) *
                item.quantity
            );

        },
        0
    );

});


const deliveryFee = computed(() => {

    if (!order.value) return 0;


    return Number(
        order.value.deliveryFee ?? 20000
    );

});


const total = computed(() => {

    if (!order.value) return 0;


    return Number(
        order.value.finalPrice
    );

});


/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

function statusColor(status) {

    switch (status) {

        case "PENDING":
            return "#f59e0b";

        case "PREPARING":
            return "#3b82f6";

        case "ON_THE_WAY":
            return "#10b981";

        case "DELIVERED":
            return "#22c55e";

        case "CANCELLED":
            return "#ef4444";

        default:
            return "#999";

    }

}


/*
|--------------------------------------------------------------------------
| Rating
|--------------------------------------------------------------------------
*/

function setRating(
    itemId,
    rating
) {

    selectedRatings.value[itemId] =
        rating;

    reviewErrors.value[itemId] = "";

}


/*
|--------------------------------------------------------------------------
| Get Review
|--------------------------------------------------------------------------
*/

function getReview(itemId) {

    return reviewsByItem.value[itemId] || null;

}


/*
|--------------------------------------------------------------------------
| Submit Review
|--------------------------------------------------------------------------
*/

async function submitReview(item) {

    const itemId = item.id;


    const rating =
        Number(
            selectedRatings.value[itemId]
        );


    /*
     * فقط Rating اجباری است.
     *
     * Comment و Complaint اختیاری هستند.
     */

    if (
        !rating ||
        rating < 1 ||
        rating > 5
    ) {

        reviewErrors.value[itemId] =
            "Please select a rating.";

        return;

    }


    reviewLoading.value[itemId] =
        true;

    reviewErrors.value[itemId] =
        "";

    reviewSuccess.value[itemId] =
        "";


    try {

        const response =
            await createReview(
                itemId,
                {

                    rating,

                    /*
                     * اگر کاربر چیزی ننویسد،
                     * رشته خالی ارسال می‌شود.
                     */

                    comment:
                        comments.value[itemId]?.trim() ||
                        "",

                    complaint:
                        complaints.value[itemId]?.trim() ||
                        ""

                }
            );


        /*
         * Review ثبت شده را
         * همان لحظه در صفحه نمایش می‌دهیم.
         */

        reviewsByItem.value[itemId] =
            response.data;


        reviewSuccess.value[itemId] =
            "Review submitted successfully.";

    }

    catch (err) {

        reviewErrors.value[itemId] =
            err.message;

    }

    finally {

        reviewLoading.value[itemId] =
            false;

    }

}


/*
|--------------------------------------------------------------------------
| Back
|--------------------------------------------------------------------------
*/

function goBack() {

    router.back();

}

</script>


<template>

<div class="container">


    <!-- Back -->

    <button
        class="back"
        @click="goBack"
    >

        ← Back

    </button>



    <!-- Loading -->

    <div
        v-if="loading"
        class="state"
    >

        <div class="spinner"></div>

        <h2>Loading order...</h2>

    </div>



    <!-- Error -->

    <div
        v-else-if="error"
        class="state error-state"
    >

        <div class="state-icon">
            !
        </div>

        <h2>{{ error }}</h2>

    </div>



    <!-- Order -->

    <div v-else>


        <!-- Main Order Card -->

        <div class="card">


            <!-- Header -->

            <div class="header">

                <div>

                    <span class="small-title">
                        ORDER DETAILS
                    </span>

                    <h1>
                        Order #{{ order.id.slice(0,8) }}
                    </h1>

                    <p class="date">
                        {{ new Date(order.createdAt).toLocaleString() }}
                    </p>

                </div>


                <span
                    class="status"
                    :style="{
                        background: statusColor(order.status)
                    }"
                >

                    {{ order.status }}

                </span>

            </div>



            <hr>



            <!-- Delivery Address -->

            <section>

                <h2>
                    📍 Delivery Address
                </h2>


                <div class="address">

                    <div class="address-icon">
                        📍
                    </div>


                    <div>

                        <strong>
                            {{ order.deliveryAddress.title }}
                        </strong>

                        <p>
                            {{ order.deliveryAddress.receiverName }}
                        </p>

                        <p>
                            {{ order.deliveryAddress.receiverPhone }}
                        </p>

                        <p class="address-text">
                            {{ order.deliveryAddress.address }}
                        </p>

                    </div>

                </div>

            </section>



            <hr>



            <!-- Items -->

            <section>

                <div class="section-heading">

                    <div>

                        <h2>
                            🍽️ Your Order
                        </h2>

                        <p>
                            {{ order.orderItems.length }}
                            item(s)
                        </p>

                    </div>

                </div>



                <div
                    v-for="item in order.orderItems"
                    :key="item.id"
                    class="item-card"
                >


                    <!-- Food -->

                    <div class="item-main">


                        <div class="food-image">

                            <img
                                v-if="item.food.imageUrl"
                                :src="item.food.imageUrl"
                                :alt="item.food.name"
                            >

                            <span v-else>
                                🍽️
                            </span>

                        </div>


                        <div class="food-info">

                            <h3>
                                {{ item.food.name }}
                            </h3>

                            <p>
                                {{ Number(item.unitPrice).toLocaleString() }}
                                تومان
                                ×
                                {{ item.quantity }}
                            </p>

                        </div>


                        <strong class="item-price">

                            {{
                                (
                                    Number(item.unitPrice) *
                                    item.quantity
                                ).toLocaleString()
                            }}

                            تومان

                        </strong>

                    </div>



                    <!-- ================================================= -->
                    <!-- REVIEW -->
                    <!-- ================================================= -->

                    <div
                        v-if="order.status === 'DELIVERED'"
                        class="review-area"
                    >


                        <!-- Already Reviewed -->

                        <div
                            v-if="getReview(item.id)"
                            class="review-done"
                        >

                            <div class="review-done-header">

                                <div>

                                    <span class="review-label">
                                        YOUR RATING
                                    </span>


                                    <div class="stars-display">

                                        <span
                                            v-for="star in 5"
                                            :key="star"
                                            :class="{
                                                active:
                                                    star <=
                                                    getReview(item.id).rating
                                            }"
                                        >
                                            ★
                                        </span>

                                    </div>

                                </div>


                                <span class="review-badge">
                                    ✓ Reviewed
                                </span>

                            </div>


                            <!-- Comment فقط اگر نوشته شده باشد -->

                            <p
                                v-if="
                                    getReview(item.id).comment
                                "
                                class="review-comment"
                            >

                                "{{ getReview(item.id).comment }}"

                            </p>


                            <!-- Complaint فقط اگر نوشته شده باشد -->

                            <p
                                v-if="
                                    getReview(item.id).complaint
                                "
                                class="complaint"
                            >

                                ⚠️
                                {{ getReview(item.id).complaint }}

                            </p>

                        </div>



                        <!-- Review Form -->

                        <div v-else>

                            <div class="review-title">

                                <div>

                                    <h4>
                                        ⭐ Rate this food
                                    </h4>

                                    <p>
                                        Choose a rating.
                                        Your comment will be visible to other customers. Your complaint will only be sent to the restaurant manager.
                                    </p>

                                </div>

                            </div>



                            <!-- Stars -->

                            <div class="star-picker">

                                <button
                                    v-for="star in 5"
                                    :key="star"
                                    type="button"
                                    class="star-button"
                                    :class="{
                                        selected:
                                            star <=
                                            (
                                                selectedRatings[item.id] ||
                                                0
                                            )
                                    }"
                                    @click="
                                        setRating(item.id, star)
                                    "
                                    :aria-label="
                                        `${star} star rating`
                                    "
                                >

                                    ★

                                </button>

                            </div>



                            <!-- Comment - Optional -->

                            <label
                                class="input-label"
                                :for="`comment-${item.id}`"
                            >
                                Comment
                                <span>(optional)</span>
                            </label>

                            <textarea
                                :id="`comment-${item.id}`"
                                v-model="comments[item.id]"
                                class="review-input"
                                rows="3"
                                placeholder="Write a comment (optional)..."
                            ></textarea>



                            <!-- Complaint - Optional -->

                            <label
                                class="input-label"
                                :for="`complaint-${item.id}`"
                            >
                                Complaint
                                <span>(optional)</span>
                            </label>

                            <textarea
                                :id="`complaint-${item.id}`"
                                v-model="complaints[item.id]"
                                class="review-input complaint-input"
                                rows="2"
                                placeholder="Add a complaint (optional)... Your complaint will only be sent to the restaurant manager."
                            ></textarea>



                            <!-- Error -->

                            <p
                                v-if="
                                    reviewErrors[item.id]
                                "
                                class="review-error"
                            >

                                {{ reviewErrors[item.id] }}

                            </p>



                            <!-- Success -->

                            <p
                                v-if="
                                    reviewSuccess[item.id]
                                "
                                class="review-success"
                            >

                                {{ reviewSuccess[item.id] }}

                            </p>



                            <!-- Submit -->

                            <button
                                class="submit-review"
                                type="button"
                                :disabled="
                                    reviewLoading[item.id]
                                "
                                @click="
                                    submitReview(item)
                                "
                            >

                                <span
                                    v-if="
                                        reviewLoading[item.id]
                                    "
                                >
                                    Sending...
                                </span>

                                <span v-else>
                                    Submit Review
                                </span>

                            </button>

                        </div>

                    </div>


                </div>

            </section>



            <hr>



            <!-- Summary -->

            <section class="summary-section">

                <h2>
                    💳 Payment Summary
                </h2>


                <div class="summary">

                    <div>

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            {{ subtotal.toLocaleString() }}
                            تومان
                        </strong>

                    </div>


                    <div>

                        <span>
                            Delivery
                        </span>

                        <strong>
                            {{ deliveryFee.toLocaleString() }}
                            تومان
                        </strong>

                    </div>


                    <div class="total">

                        <span>
                            Total
                        </span>

                        <strong>
                            {{ total.toLocaleString() }}
                            تومان
                        </strong>

                    </div>

                </div>

            </section>


        </div>



        <!-- Delivered message -->

        <div
            v-if="order.status === 'DELIVERED'"
            class="thank-you"
        >

            <span>🎉</span>

            <div>

                <strong>
                    Order delivered!
                </strong>

                <p>
                    Thank you for ordering from us.
                </p>

            </div>

        </div>


    </div>

</div>

</template>


<style scoped>

.container {

    max-width: 900px;

    margin: 40px auto;

    padding: 0 20px;

}


.back {

    margin-bottom: 20px;

    padding: 10px 18px;

    border: none;

    border-radius: 10px;

    background: #42b883;

    color: white;

    cursor: pointer;

    font-size: 14px;

    transition: .2s;

}


.back:hover {

    transform: translateX(-3px);

    background: #369d70;

}


.card {

    background: white;

    padding: 32px;

    border-radius: 20px;

    box-shadow:
        0 8px 30px rgba(0,0,0,.08);

}


.header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 20px;

    margin-bottom: 25px;

}


.small-title {

    font-size: 11px;

    font-weight: 700;

    letter-spacing: 1.5px;

    color: #999;

}


.header h1 {

    margin: 5px 0;

    font-size: 28px;

}


.date {

    margin: 0;

    color: #888;

    font-size: 14px;

}


.status {

    padding: 9px 16px;

    border-radius: 30px;

    color: white;

    font-weight: 700;

    font-size: 13px;

}


hr {

    border: none;

    border-top: 1px solid #eee;

    margin: 28px 0;

}


h2 {

    margin: 0 0 15px;

    font-size: 20px;

}


.address {

    display: flex;

    align-items: flex-start;

    gap: 15px;

    background: #f7f9f8;

    padding: 18px;

    border-radius: 14px;

}


.address-icon {

    width: 42px;

    height: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: white;

    border-radius: 50%;

    font-size: 20px;

}


.address p {

    margin: 6px 0;

    color: #666;

}


.address-text {

    line-height: 1.7;

}


.section-heading {

    display: flex;

    justify-content: space-between;

}


.section-heading p {

    margin-top: -8px;

    color: #999;

    font-size: 13px;

}


.item-card {

    margin-bottom: 18px;

    border: 1px solid #eee;

    border-radius: 16px;

    overflow: hidden;

}


.item-main {

    display: flex;

    align-items: center;

    gap: 16px;

    padding: 18px;

}


.food-image {

    width: 68px;

    height: 68px;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    overflow: hidden;

    border-radius: 12px;

    background: #f1f3f2;

    font-size: 28px;

}


.food-image img {

    width: 100%;

    height: 100%;

    object-fit: cover;

}


.food-info {

    flex: 1;

}


.food-info h3 {

    margin: 0 0 7px;

    font-size: 17px;

}


.food-info p {

    margin: 0;

    color: #888;

    font-size: 14px;

}


.item-price {

    white-space: nowrap;

    font-size: 15px;

}


/*
|--------------------------------------------------------------------------
| Review
|--------------------------------------------------------------------------
*/

.review-area {

    padding: 20px;

    background: #fafcfb;

    border-top: 1px solid #eee;

}


.review-title h4 {

    margin: 0 0 5px;

    font-size: 16px;

}


.review-title p {

    margin: 0;

    color: #888;

    font-size: 13px;

    line-height: 1.6;

}


/*
|--------------------------------------------------------------------------
| Input Labels
|--------------------------------------------------------------------------
*/

.input-label {

    display: block;

    margin: 4px 0 7px;

    font-size: 13px;

    font-weight: 600;

    color: #555;

}


.input-label span {

    font-weight: 400;

    color: #999;

}


/*
|--------------------------------------------------------------------------
| Stars
|--------------------------------------------------------------------------
*/

.star-picker {

    display: flex;

    gap: 5px;

    margin: 15px 0 20px;

}


.star-button {

    border: none;

    background: transparent;

    cursor: pointer;

    font-size: 32px;

    color: #d5d8d7;

    padding: 0 3px;

    transition: .15s;

}


.star-button:hover {

    transform: scale(1.15);

    color: #f5b942;

}


.star-button.selected {

    color: #f5b942;

}


/*
|--------------------------------------------------------------------------
| Inputs
|--------------------------------------------------------------------------
*/

.review-input {

    width: 100%;

    box-sizing: border-box;

    resize: vertical;

    border: 1px solid #ddd;

    border-radius: 10px;

    padding: 12px;

    margin-bottom: 13px;

    font-family: inherit;

    font-size: 14px;

    outline: none;

    background: white;

}


.review-input:focus {

    border-color: #42b883;

    box-shadow:
        0 0 0 3px rgba(66,184,131,.1);

}


.complaint-input {

    border-color: #f0dddd;

}


.complaint-input:focus {

    border-color: #e5a5a5;

    box-shadow:
        0 0 0 3px rgba(220,38,38,.08);

}


/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

.submit-review {

    border: none;

    border-radius: 10px;

    padding: 11px 18px;

    background: #42b883;

    color: white;

    font-weight: 600;

    cursor: pointer;

    transition: .2s;

}


.submit-review:hover {

    background: #369d70;

    transform: translateY(-1px);

}


.submit-review:disabled {

    opacity: .6;

    cursor: not-allowed;

    transform: none;

}


/*
|--------------------------------------------------------------------------
| Existing Review
|--------------------------------------------------------------------------
*/

.review-done {

    background: white;

    padding: 16px;

    border-radius: 12px;

    border: 1px solid #e7eee9;

}


.review-done-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 10px;

}


.review-label {

    display: block;

    font-size: 10px;

    font-weight: 700;

    letter-spacing: 1px;

    color: #999;

    margin-bottom: 4px;

}


.stars-display {

    display: flex;

    gap: 2px;

}


.stars-display span {

    color: #ddd;

    font-size: 21px;

}


.stars-display span.active {

    color: #f5b942;

}


.review-badge {

    padding: 5px 9px;

    border-radius: 20px;

    background: #eaf8f0;

    color: #26935f;

    font-size: 11px;

    font-weight: 700;

}


.review-comment {

    margin: 14px 0 0;

    color: #555;

    line-height: 1.7;

}


.complaint {

    margin: 10px 0 0;

    padding: 9px 12px;

    background: #fff5f5;

    color: #b45353;

    border-radius: 8px;

    font-size: 13px;

}


/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

.review-error {

    color: #dc2626;

    font-size: 13px;

    margin: 0 0 10px;

}


.review-success {

    color: #26935f;

    font-size: 13px;

    margin: 0 0 10px;

}


/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

.summary-section h2 {

    margin-bottom: 20px;

}


.summary {

    display: flex;

    flex-direction: column;

    gap: 14px;

}


.summary > div {

    display: flex;

    justify-content: space-between;

    color: #666;

}


.total {

    margin-top: 8px;

    padding-top: 18px;

    border-top: 2px solid #eee;

    font-size: 20px;

    color: #222 !important;

}


.total strong {

    color: #42b883;

}


/*
|--------------------------------------------------------------------------
| Bottom
|--------------------------------------------------------------------------
*/

.thank-you {

    display: flex;

    align-items: center;

    gap: 14px;

    margin-top: 18px;

    padding: 18px 20px;

    border-radius: 15px;

    background: #edf9f3;

    color: #237a50;

}


.thank-you > span {

    font-size: 28px;

}


.thank-you strong {

    display: block;

    margin-bottom: 4px;

}


.thank-you p {

    margin: 0;

    font-size: 13px;

}


/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

.state {

    text-align: center;

    padding: 80px 20px;

}


.spinner {

    width: 35px;

    height: 35px;

    margin: 0 auto 15px;

    border: 4px solid #eee;

    border-top-color: #42b883;

    border-radius: 50%;

    animation: spin 1s linear infinite;

}


@keyframes spin {

    to {
        transform: rotate(360deg);
    }

}


.state-icon {

    width: 45px;

    height: 45px;

    margin: auto;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    background: #fee2e2;

    color: #dc2626;

    font-weight: bold;

}


/*
|--------------------------------------------------------------------------
| Mobile
|--------------------------------------------------------------------------
*/

@media (max-width: 600px) {

    .container {

        margin: 20px auto;

        padding: 0 12px;

    }


    .card {

        padding: 20px;

    }


    .header {

        align-items: flex-start;

        flex-direction: column;

    }


    .header h1 {

        font-size: 23px;

    }


    .item-main {

        align-items: flex-start;

    }


    .item-price {

        font-size: 13px;

    }


    .food-image {

        width: 55px;

        height: 55px;

    }


    .review-done-header {

        align-items: flex-start;

        flex-direction: column;

    }

}

</style>