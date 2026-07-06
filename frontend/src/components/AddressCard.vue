<template>

<div class="card">

    <h3>

        {{ address.title }}

        <span
            v-if="address.isDefault"
            class="default"
        >
            Default
        </span>

    </h3>

    <p>{{ address.receiverName }}</p>

    <p>{{ address.receiverPhone }}</p>

    <p>{{ address.address }}</p>

    <div class="buttons">

        <button
            @click="$emit('default', address.id)"
        >
            Default
        </button>

        <button
            class="delete"
            @click="$emit('delete', address.id)"
        >
            Delete
        </button>

    </div>

</div>

</template>

<script setup>

defineProps({

    address: Object

});

defineEmits([

    "delete",

    "default"

]);

</script>

<style scoped>

.card{

    border:1px solid #ddd;

    border-radius:12px;

    padding:20px;

    background:white;

}

.default{

    margin-left:10px;

    color:#42b883;

    font-size:14px;

}

.buttons{

    margin-top:15px;

    display:flex;

    gap:10px;

}

button{

    padding:8px 15px;

    border:none;

    border-radius:8px;

    cursor:pointer;

}

.delete{

    background:#ff4d4f;

    color:white;

}

</style>