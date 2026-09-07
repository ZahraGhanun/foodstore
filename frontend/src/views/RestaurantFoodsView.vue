<script setup>
import { ref, computed, onMounted } from "vue";

import {
    getMyFoods,
    deleteFood,
    moveFood
} from "../services/restaurant-food.service.js";

import AddFoodModal from "../components/AddFoodModal.vue";

const showDeleteModal = ref(false);

const selectedFoodToDelete = ref(null);
const selectedFood = ref(null);
const showAddModal = ref(false);
const foods = ref([]);
const loading = ref(true);
const error = ref("");

onMounted(loadFoods);

async function loadFoods() {

    loading.value = true;
    error.value = "";

    try {

        const response = await getMyFoods();

        foods.value = response.data;

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}

function addFood() {

    selectedFood.value = null;

    showAddModal.value = true;

}

function editFood(food) {

    selectedFood.value = food;

    showAddModal.value = true;

}

function deleteFoodHandler(food) {

    selectedFoodToDelete.value = food;

    showDeleteModal.value = true;

}

async function confirmDelete() {

    try {

        await deleteFood(selectedFoodToDelete.value.id);

        showDeleteModal.value = false;

        selectedFoodToDelete.value = null;

        await loadFoods();

    }

    catch (err) {

        alert(err.message);

    }

}

function cancelDelete() {

    showDeleteModal.value = false;

    selectedFoodToDelete.value = null;

}

async function moveFoodHandler(food, direction) {

    try {

        await moveFood(food.id, direction);

        await loadFoods();

    }

    catch (err) {

        alert(err.message);

    }

}


/*
 * Group foods by category.
 *
 * Each category keeps its own foods,
 * so ↑ and ↓ can only affect foods
 * inside that category.
 */
const groupedFoods = computed(() => {

    const groups = new Map();

    for (const food of foods.value) {

        const categoryId =
            food.category?.id || food.categoryId;

        const categoryName =
            food.category?.name || "Uncategorized";

        if (!groups.has(categoryId)) {

            groups.set(categoryId, {
                id: categoryId,
                name: categoryName,
                foods: []
            });

        }

        groups.get(categoryId).foods.push(food);

    }

    return Array.from(groups.values());

});

</script>

<template>

<div class="container">

    <div class="header">

        <div>

            <h1>

                🍔 Manage Foods

                <span class="count">

                    ({{ foods.length }})

                </span>

            </h1>

            <p>

                Manage all foods in your restaurant.

            </p>

        </div>

        <button
            class="add-btn"
            @click="addFood"
        >

            ＋ Add Food

        </button>

    </div>


    <div v-if="loading">

        Loading...

    </div>


    <div v-else-if="error">

        {{ error }}

    </div>


    <div
        v-else-if="foods.length === 0"
        class="empty"
    >

        No foods found.

    </div>


    <div
        v-else
        class="categories"
    >

        <div
            v-for="category in groupedFoods"
            :key="category.id"
            class="category-section"
        >

            <div class="category-header">

                <h2>

                    📂 {{ category.name }}

                </h2>

                <span class="category-count">

                    {{ category.foods.length }}

                </span>

            </div>


            <div class="category-line"></div>


            <div class="foods">

                <div
                    v-for="food in category.foods"
                    :key="food.id"
                    class="card"
                >

                    <img
                        :src="
                            food.imageUrl ||
                            'https://picsum.photos/140'
                        "
                        alt="food"
                    >


                    <div class="info">

                        <h2>

                            {{ food.name }}

                        </h2>

                        <p
                            v-if="food.description"
                        >

                            {{ food.description }}

                        </p>

                        <strong>

                            {{ Number(food.price).toLocaleString() }}

                            تومان

                        </strong>


                        <span
                            v-if="food.isActive"
                            class="status active"
                        >

                            ✅ Active

                        </span>

                        <span
                            v-else
                            class="status inactive"
                        >

                            ❌ Inactive

                        </span>

                    </div>


                    <div class="actions">

                        <button
                            class="move"
                            @click="
                                moveFoodHandler(
                                    food,
                                    'up'
                                )
                            "
                        >

                            ↑

                        </button>


                        <button
                            class="move"
                            @click="
                                moveFoodHandler(
                                    food,
                                    'down'
                                )
                            "
                        >

                            ↓

                        </button>


                        <button
                            class="edit"
                            @click="editFood(food)"
                        >

                            ✏ Edit

                        </button>


                        <button
                            class="delete"
                            @click="
                                deleteFoodHandler(food)
                            "
                        >

                            🗑 Delete

                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>

</div>


<AddFoodModal

    v-model="showAddModal"

    :food="selectedFood"

    @saved="loadFoods"

/>


<div
    v-if="showDeleteModal"
    class="modal-overlay"
>

    <div class="delete-modal">

        <div class="delete-icon">

            🗑

        </div>

        <h2>

            Delete Food

        </h2>

        <p>

            Are you sure you want to delete

            <strong>

                {{ selectedFoodToDelete?.name }}

            </strong>

            ?

        </p>

        <small>

            This action cannot be undone.

        </small>


        <div class="modal-buttons">

            <button
                class="cancel-btn"
                @click="cancelDelete"
            >

                Cancel

            </button>


            <button
                class="delete-btn"
                @click="confirmDelete"
            >

                Delete

            </button>

        </div>

    </div>

</div>

</template>


<style scoped>

.container {

    max-width: 1100px;
    margin: 40px auto;
    padding: 0 20px;

}


/* Header */

.header {

    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 35px;

}

.header h1 {

    margin: 0;

}

.header p {

    margin-top: 8px;
    color: #666;

}

.count {

    color: #42b883;
    font-size: 20px;

}

.add-btn {

    padding: 12px 22px;
    border: none;
    border-radius: 10px;
    background: #42b883;
    color: white;
    cursor: pointer;
    font-size: 15px;
    font-weight: bold;
    transition: .2s;

}

.add-btn:hover {

    background: #369f74;

}


/* Categories */

.categories {

    display: flex;
    flex-direction: column;
    gap: 45px;

}

.category-section {

    width: 100%;

}

.category-header {

    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

}

.category-header h2 {

    margin: 0;
    font-size: 24px;

}

.category-count {

    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-width: 28px;
    height: 28px;

    padding: 0 8px;

    border-radius: 20px;

    background: #e8f8f1;
    color: #42b883;

    font-size: 13px;
    font-weight: bold;

}

.category-line {

    width: 100%;
    height: 1px;
    background: #e5e7eb;
    margin-bottom: 20px;

}


/* Foods */

.foods {

    display: flex;
    flex-direction: column;
    gap: 20px;

}


/* Food card */

.card {

    display: flex;
    align-items: center;
    gap: 22px;

    background: white;
    border-radius: 16px;

    padding: 20px;

    box-shadow: 0 2px 10px rgba(0,0,0,.08);

    transition: .2s;

}

.card:hover {

    transform: translateY(-3px);

    box-shadow:
        0 8px 20px rgba(0,0,0,.12);

}


img {

    width: 140px;
    height: 140px;

    border-radius: 12px;

    object-fit: cover;

}


.info {

    flex: 1;

}

.info h2 {

    margin-bottom: 10px;

}

.info p {

    color: #666;
    margin-bottom: 10px;

}

.info strong {

    display: block;

    margin-bottom: 12px;

    color: #42b883;

    font-size: 18px;

}


/* Status */

.status {

    display: inline-block;

    padding: 6px 14px;

    border-radius: 20px;

    font-size: 13px;
    font-weight: bold;

}

.active {

    background: #dcfce7;
    color: #15803d;

}

.inactive {

    background: #fee2e2;
    color: #dc2626;

}


/* Actions */

.actions {

    display: flex;

    flex-direction: column;

    gap: 12px;

}

.actions button {

    border: none;

    color: white;

    padding: 10px 18px;

    border-radius: 8px;

    cursor: pointer;

    transition: .2s;

    font-weight: bold;

}

.move {

    background: #3b82f6;

    font-size: 18px;

}

.move:hover {

    background: #2563eb;

}

.edit {

    background: #42b883;

}

.edit:hover {

    background: #369f74;

}

.delete {

    background: #ef4444;

}

.delete:hover {

    background: #dc2626;

}


/* Empty */

.empty {

    text-align: center;

    padding: 70px;

    background: white;

    border-radius: 14px;

    box-shadow:
        0 2px 10px rgba(0,0,0,.08);

    color: #666;

}


/* Delete modal */

.modal-overlay {

    position: fixed;

    inset: 0;

    background: rgba(0,0,0,.45);

    display: flex;

    justify-content: center;

    align-items: center;

    z-index: 999;

}

.delete-modal {

    width: 420px;

    max-width: 90%;

    background: white;

    border-radius: 18px;

    padding: 30px;

    text-align: center;

    box-shadow:
        0 20px 50px rgba(0,0,0,.2);

}

.delete-icon {

    font-size: 54px;

    margin-bottom: 12px;

}

.delete-modal h2 {

    margin-bottom: 14px;

}

.delete-modal p {

    color: #555;

    line-height: 1.7;

    margin-bottom: 8px;

}

.delete-modal small {

    color: #999;

}

.modal-buttons {

    display: flex;

    justify-content: center;

    gap: 16px;

    margin-top: 26px;

}

.cancel-btn {

    padding: 10px 22px;

    border: none;

    border-radius: 10px;

    background: #e5e7eb;

    cursor: pointer;

    font-weight: bold;

}

.cancel-btn:hover {

    background: #d1d5db;

}

.delete-btn {

    padding: 10px 22px;

    border: none;

    border-radius: 10px;

    background: #ef4444;

    color: white;

    cursor: pointer;

    font-weight: bold;

}

.delete-btn:hover {

    background: #dc2626;

}


/* Responsive */

@media(max-width: 800px) {

    .header {

        flex-direction: column;

        align-items: flex-start;

        gap: 20px;

    }

    .add-btn {

        width: 100%;

    }

    .card {

        flex-direction: column;

        align-items: flex-start;

    }

    .actions {

        width: 100%;

        flex-direction: row;

        flex-wrap: wrap;

    }

    .actions button {

        flex: 1;

    }

}

</style>