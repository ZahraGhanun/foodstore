<script setup>
import { ref, reactive, watch, onMounted } from "vue";

import {

    createFood,

    updateFood

} from "../services/restaurant-food.service.js";

import { getMyCategories } from "../services/restaurant-category.service.js";

const props = defineProps({

    modelValue: Boolean,

    food: {

        type: Object,

        default: null

    }

});
const emit = defineEmits([

    "update:modelValue",

    "saved"

]);

const categories = ref([]);

const saving = ref(false);

const form = reactive({

    name: "",

    description: "",

    price: "",

    imageUrl: "",

    categoryId: "",

    isActive: true

});
watch(

    () => props.modelValue,

    async (value) => {

        if (!value) return;

        await loadCategories();

        if (props.food) {

            form.name = props.food.name;

            form.description = props.food.description || "";

            form.price = Number(props.food.price);

            form.imageUrl = props.food.imageUrl || "";

            form.categoryId = props.food.categoryId;

            form.isActive = props.food.isActive;

        }

        else {

            resetForm();

        }

    }

);
async function loadCategories() {

    try {

        const response = await getMyCategories();

        categories.value = response.data;

    }

    catch (err) {

        alert(err.message);

    }

}

function close() {

    emit("update:modelValue", false);

}

function resetForm() {

    form.name = "";

    form.description = "";

    form.price = "";

    form.imageUrl = "";

    form.categoryId = "";

    form.isActive = true;

}
async function saveFood() {

    if (

        !form.name ||

        !form.price ||

        !form.categoryId

    ) {

        alert("Please fill all required fields.");

        return;

    }

    saving.value = true;

    try {

        const payload = {

            name: form.name,

            description: form.description,

            price: Number(form.price),

            imageUrl: form.imageUrl,

            categoryId: form.categoryId,

            isActive: form.isActive

        };

        if (props.food) {

            await updateFood(

                props.food.id,

                payload

            );

        }

        else {

            await createFood(payload);

        }

        close();

        emit("saved");

    }

    catch (err) {

        alert(err.message);

    }

    finally {

        saving.value = false;

    }

}
</script>

<template>

<Teleport to="body">

<div
    v-if="modelValue"
    class="overlay"
>

<div class="modal">

<h2>

{{ props.food ? "✏ Edit Food" : "🍔 Add New Food" }}

</h2>

<div class="field">

<label>

Name *

</label>

<input
    v-model="form.name"
/>

</div>

<div class="field">

<label>

Description

</label>

<textarea
    v-model="form.description"
/>

</div>

<div class="field">

<label>

Price *

</label>

<input
    type="number"
    v-model="form.price"
/>

</div>

<div class="field">

<label>

Image URL

</label>

<input
    v-model="form.imageUrl"
/>

</div>

<div class="field">

<label>

Category *

</label>

<select
    v-model="form.categoryId"
>

<option
    value=""
>

Select category

</option>

<option
    v-for="category in categories"
    :key="category.id"
    :value="category.id"
>

{{ category.name }}

</option>

</select>

</div>

<div class="field checkbox">

<label>

<input
    type="checkbox"
    v-model="form.isActive"
/>

Active

</label>

</div>

<div class="buttons">

<button
    class="cancel"
    @click="close"
>

Cancel

</button>

<button
    class="save"
    @click="saveFood"
    :disabled="saving"
>

{{ saving ? "Saving..." : "Save Food" }}

</button>

</div>

</div>

</div>

</Teleport>

</template>

<style scoped>

.overlay{

    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);

    display:flex;
    justify-content:center;
    align-items:center;

    z-index:999;

}

.modal{

    width:520px;

    max-width:95%;

    max-height:90vh;

    overflow-y:auto;

    background:white;

    border-radius:16px;

    padding:22px 28px;

    box-shadow:0 10px 30px rgba(0,0,0,.2);

}

.modal h2{

    margin-bottom:18px;

}

.field{

    display:flex;

    flex-direction:column;

    gap:5px;

    margin-bottom:14px;

}

.field label{

    font-weight:bold;

}
.field input,
.field textarea,
.field select{

    padding:10px 12px;

    border:1px solid #ddd;

    border-radius:8px;

    font-size:15px;

}

textarea{

    min-height:70px;

    resize:vertical;

}

.checkbox{

    flex-direction:row;

    align-items:center;

}

.checkbox label{

    display:flex;

    align-items:center;

    gap:10px;

}

.buttons{

    display:flex;

    justify-content:flex-end;

    gap:12px;

    margin-top:18px;

}

.cancel{

    background:#999;

}

.save{

    background:#42b883;

}

.buttons button{

    border:none;

    color:white;

    padding:12px 22px;

    border-radius:8px;

    cursor:pointer;

    font-weight:bold;

}

.buttons button:disabled{

    opacity:.6;

    cursor:not-allowed;

}

</style>