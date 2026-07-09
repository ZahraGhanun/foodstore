<script setup>

import { reactive, ref, watch } from "vue";
import {

    createCategory,
    updateCategory

} from "../services/restaurant-category.service.js";

const props = defineProps({

    modelValue: Boolean,

    category: {

        type: Object,

        default: null

    }

});

const emit = defineEmits([

    "update:modelValue",

    "saved"

]);

const saving = ref(false);

const form = reactive({

    name:""

});

watch(

    ()=>props.modelValue,

    (value)=>{

        if(value){

            resetForm();

        }

    }

);

function resetForm(){

    form.name="";

}

function close(){

    emit(

        "update:modelValue",

        false

    );

}
async function saveCategory() {

    if (!form.name) {

        alert("Category name is required.");

        return;

    }

    saving.value = true;

    try {

        if (props.category) {

            await updateCategory(

                props.category.id,

                {

                    name: form.name

                }

            );

        }

        else {

            await createCategory({

                name: form.name

            });

        }

        emit("saved");

        close();

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

<div
    v-if="modelValue"
    class="overlay"
>

    <div class="modal">

        <h2>

    {{ props.category ? "✏ Edit Category" : "📂 Add Category" }}

</h2>

        <div class="field">

            <label>

                Name *

            </label>

            <input
                v-model="form.name"
                type="text"
                placeholder="Pizza"
            >

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
                @click="saveCategory"
                :disabled="saving"
            >

                {{ saving ? "Saving..." : (props.category ? "Update Category" : "Save Category") }}

            </button>

        </div>

    </div>

</div>

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

    width:460px;

    max-width:95%;

    background:white;

    border-radius:16px;

    padding:24px;

    box-shadow:0 10px 30px rgba(0,0,0,.2);

}

.modal h2{

    margin-bottom:20px;

}

.field{

    display:flex;

    flex-direction:column;

    gap:6px;

    margin-bottom:18px;

}

.field input{

    padding:11px 12px;

    border:1px solid #ddd;

    border-radius:8px;

    font-size:15px;

}

.buttons{

    display:flex;

    justify-content:flex-end;

    gap:12px;

    margin-top:20px;

}

.cancel{

    padding:10px 20px;

    border:none;

    border-radius:8px;

    background:#e5e7eb;

    cursor:pointer;

}

.save{

    padding:10px 20px;

    border:none;

    border-radius:8px;

    background:#42b883;

    color:white;

    cursor:pointer;

    font-weight:bold;

}

.save:hover{

    background:#369f74;

}

.save:disabled{

    opacity:.6;

    cursor:not-allowed;

}

</style>