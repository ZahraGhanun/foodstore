<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getFoodReviews } from "../services/review.service.js";


const route = useRoute();

const food = ref(null);
const reviews = ref([]);

const loading = ref(true);
const error = ref("");


onMounted(async () => {

    try {

        const response =
            await getFoodReviews(route.params.foodId);

        food.value = response.data.food;
        reviews.value = response.data.reviews;

    } catch (err) {

        console.error(err);

        error.value = err.message;

    } finally {

        loading.value = false;

    }

});
</script>


<template>

    <div class="container">

        <!-- Loading -->

        <div v-if="loading">

            <h2>Loading...</h2>

        </div>


        <!-- Error -->

        <div v-else-if="error">

            <h2>{{ error }}</h2>

        </div>


        <!-- Content -->

        <div v-else-if="food">

            <!-- Food information -->

            <div class="food-header">

                <img
                    :src="
                        food.imageUrl ||
                        'https://picsum.photos/400/250'
                    "
                    :alt="food.name"
                >

                <div>

                    <h1>
                        {{ food.name }}
                    </h1>

                    <p>
                        {{ food.price }} تومان
                    </p>

                </div>

            </div>


            <hr>


            <!-- Reviews -->

            <h2>
                Reviews
            </h2>


            <div
                v-if="reviews.length"
                class="reviews"
            >

                <div
                    v-for="review in reviews"
                    :key="review.id"
                    class="review"
                >

                    <!-- Rating -->

                    <div class="rating">

                        <span
                            v-for="star in 5"
                            :key="star"
                        >
                            {{ star <= review.rating ? "⭐" : "☆" }}
                        </span>

                    </div>


                    <!-- Comment -->

                    <p
                        v-if="review.comment"
                        class="comment"
                    >
                        {{ review.comment }}
                    </p>


                    <p
                        v-else
                        class="no-comment"
                    >
                        No comment.
                    </p>


                    <!-- Date -->

                    <small>
                        {{ new Date(review.createdAt).toLocaleDateString() }}
                    </small>

                </div>

            </div>


            <div v-else>

                <p>
                    No reviews yet.
                </p>

            </div>

        </div>

    </div>

</template>


<style scoped>

.container {

    max-width: 900px;

    margin: 40px auto;

    padding: 20px;

}


.food-header {

    display: flex;

    gap: 25px;

    align-items: center;

    margin-bottom: 30px;

}


.food-header img {

    width: 220px;

    height: 150px;

    object-fit: cover;

    border-radius: 12px;

}


.food-header h1 {

    margin-bottom: 10px;

}


.reviews {

    display: flex;

    flex-direction: column;

    gap: 20px;

    margin-top: 20px;

}


.review {

    padding: 20px;

    border: 1px solid #ddd;

    border-radius: 12px;

    background: white;

}


.rating {

    margin-bottom: 10px;

    font-size: 18px;

}


.comment {

    margin: 10px 0;

    line-height: 1.7;

}


.no-comment {

    color: #888;

    font-style: italic;

}


small {

    color: #777;

}

</style>