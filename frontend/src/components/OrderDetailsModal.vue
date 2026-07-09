<script setup>

const props = defineProps({

    modelValue: Boolean,

    order: Object

});

const emit = defineEmits([

    "update:modelValue"

]);

function close(){

    emit(

        "update:modelValue",

        false

    );

}

</script>

<template>

<div
    v-if="modelValue && order"
    class="overlay"
>

    <div class="modal">

        <div class="header">

            <h2>

                📦 Order #{{ order.id.slice(0,8) }}

            </h2>

            <button
                class="close"
                @click="close"
            >

                ✕

            </button>

        </div>

        <div class="section">

            <p>

                <strong>👤 Customer:</strong>

                {{ order.user.firstName }}

                {{ order.user.lastName }}

            </p>

            <p>

                <strong>📞 Phone:</strong>

                {{ order.user.phone }}

            </p>

            <p v-if="order.deliveryAddress">

                <strong>📍 Address:</strong>

                {{ order.deliveryAddress.address }}

            </p>

        </div>

        <hr>

        <div class="foods">

            <div

                v-for="item in order.orderItems"

                :key="item.id"

                class="food"

            >

                <div>

                    <strong>

                        {{ item.food.name }}

                    </strong>

                    × {{ item.quantity }}

                </div>

                <div>

                    {{ Number(item.unitPrice).toLocaleString() }}

                    تومان

                </div>

            </div>

        </div>

        <hr>

        <div class="totals">

            <div>

                <span>Subtotal</span>

                <strong>

                    {{ Number(order.totalPrice).toLocaleString() }}

                    تومان

                </strong>

            </div>

            <div>

                <span>Delivery</span>

                <strong>

                    {{ Number(order.deliveryFee).toLocaleString() }}

                    تومان

                </strong>

            </div>

            <div class="final">

                <span>Final Price</span>

                <strong>

                    {{ Number(order.finalPrice).toLocaleString() }}

                    تومان

                </strong>

            </div>

        </div>

        <button
            class="done"
            @click="close"
        >

            Close

        </button>

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

    width:650px;

    max-width:95%;

    background:white;

    border-radius:18px;

    padding:28px;

    box-shadow:0 10px 30px rgba(0,0,0,.2);

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:20px;

}

.close{

    border:none;

    background:none;

    font-size:22px;

    cursor:pointer;

}

.section{

    line-height:2;

}

.foods{

    display:flex;

    flex-direction:column;

    gap:14px;

    margin:20px 0;

}

.food{

    display:flex;

    justify-content:space-between;

    align-items:center;

}

.totals{

    margin-top:20px;

    display:flex;

    flex-direction:column;

    gap:12px;

}

.totals div{

    display:flex;

    justify-content:space-between;

}

.final{

    margin-top:10px;

    padding-top:12px;

    border-top:2px solid #eee;

    font-size:18px;

}

.done{

    width:100%;

    margin-top:25px;

    border:none;

    padding:14px;

    border-radius:10px;

    background:#42b883;

    color:white;

    font-weight:bold;

    cursor:pointer;

}

.done:hover{

    background:#369f74;

}

</style>
