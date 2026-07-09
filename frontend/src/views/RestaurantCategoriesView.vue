<script setup>
import { ref, onMounted } from "vue";

import AddCategoryModal from "../components/AddCategoryModal.vue";

import {

    getMyCategories,
    deleteCategory as deleteCategoryApi

} from "../services/restaurant-category.service.js";

const categories = ref([]);

const loading = ref(true);

const error = ref("");

const showAddModal = ref(false);

const selectedCategory = ref(null);


onMounted(loadCategories);

async function loadCategories() {

    loading.value = true;

    error.value = "";

    try {

        const response = await getMyCategories();

        categories.value = response.data;

    }

    catch (err) {

        error.value = err.message;

    }

    finally {

        loading.value = false;

    }

}

function addCategory(){

    selectedCategory.value = null;

    showAddModal.value = true;

}

function editCategory(category){

    selectedCategory.value = category;

    showAddModal.value = true;

}

async function deleteCategoryHandler(category) {

    const ok = confirm(

        `Delete "${category.name}" ?`

    );

    if (!ok) return;

    try {

        await deleteCategoryApi(

            category.id

        );

        await loadCategories();

    }

    catch (err) {

        alert(err.message);

    }

}
</script>

<template>

<div class="container">

    <div class="header">

        <div>

    <h1>

        📂 Manage Categories

        <span class="count">

            ({{ categories.length }})

        </span>

    </h1>

    <p>

        Organize all categories in your restaurant.

    </p>

</div>

        <button
            class="add-btn"
            @click="addCategory"
        >

            ＋ Add Category

        </button>

    </div>

    <div v-if="loading">

        Loading...

    </div>

    <div v-else-if="error">

        {{ error }}

    </div>

    <div
        v-else-if="categories.length===0"
        class="empty"
    >

        No categories found.

    </div>

    <div
        v-else
        class="list"
    >

        <div
    v-for="category in categories"
    :key="category.id"
    class="card"
>

    <div class="info">

        <div class="icon">

            📂

        </div>

        <div>

            <h2>

                {{ category.name }}

            </h2>

            <p>

                Foods:

                {{ category.foods?.length ?? 0 }}

            </p>

        </div>

    </div>

    <div class="actions">

        <button
            class="edit"
            @click="editCategory(category)"
        >

            ✏ Edit

        </button>

        <button
            class="delete"
            @click="deleteCategoryHandler(category)"
        >

            🗑 Delete

        </button>

    </div>

</div>

    </div>

</div>

<AddCategoryModal

    v-model="showAddModal"

    :category="selectedCategory"

    @saved="loadCategories"

/>
</template>


<style scoped>

.container{

    max-width:1100px;

    margin:40px auto;

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}

.header h1{

    margin:0;

}

.header p{

    margin-top:8px;

    color:#666;

}

.count{

    color:#42b883;

    font-size:20px;

}

.add-btn{

    padding:12px 22px;

    border:none;

    border-radius:10px;

    background:#42b883;

    color:white;

    cursor:pointer;

    font-size:15px;

    font-weight:bold;

    transition:.2s;

}

.add-btn:hover{

    background:#369f74;

}

.list{

    display:flex;

    flex-direction:column;

    gap:20px;

}

.card{

    display:flex;

    justify-content:space-between;

    align-items:center;

    background:white;

    padding:22px;

    border-radius:16px;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

    transition:.2s;

}

.card:hover{

    transform:translateY(-3px);

    box-shadow:0 8px 20px rgba(0,0,0,.12);

}

.info{

    display:flex;

    align-items:center;

    gap:18px;

}

.icon{

    font-size:42px;

}

.info h2{

    margin:0 0 8px 0;

}

.info p{

    margin:0;

    color:#666;

}

.actions{

    display:flex;

    gap:12px;

}

.actions button{

    border:none;

    color:white;

    padding:10px 18px;

    border-radius:8px;

    cursor:pointer;

    font-weight:bold;

    transition:.2s;

}

.edit{

    background:#42b883;

}

.edit:hover{

    background:#369f74;

}

.delete{

    background:#ef4444;

}

.delete:hover{

    background:#dc2626;

}

.empty{

    background:white;

    border-radius:14px;

    padding:70px;

    text-align:center;

    box-shadow:0 2px 10px rgba(0,0,0,.08);

    color:#666;

}

@media(max-width:700px){

    .card{

        flex-direction:column;

        align-items:flex-start;

        gap:20px;

    }

    .actions{

        width:100%;

    }

    .actions button{

        flex:1;

    }

}

</style>