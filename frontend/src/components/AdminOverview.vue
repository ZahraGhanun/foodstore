<template>

<div>

    <h1>
        📊 Overview
    </h1>

    <p>
        FoodStore statistics will appear here.
    </p>


    <div class="stats">


        <div class="stat-card">

            <span>👥</span>

            <h3>
                Users
            </h3>

            <strong>
                Coming Soon
            </strong>

        </div>


        <div class="stat-card">

            <span>🏬</span>

            <h3>
                Restaurants
            </h3>

            <strong>
                Coming Soon
            </strong>

        </div>


        <div class="stat-card">

            <span>📦</span>

            <h3>
                Orders
            </h3>

            <strong>
                Coming Soon
            </strong>

        </div>


        <div class="stat-card">

            <span>🚗</span>

            <h3>
                Drivers
            </h3>

            <strong>
                Coming Soon
            </strong>

        </div>


    </div>

</div>

</template>


<style scoped>

p {
    color: #666;
}

.stats {

    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 20px;

    margin-top: 30px;

}

.stat-card {

    background: white;

    padding: 25px;

    border-radius: 16px;

    box-shadow:
        0 2px 12px
        rgba(0,0,0,.08);

}

.stat-card span {

    font-size: 28px;

}

.stat-card h3 {

    margin: 12px 0;

}

.stat-card strong {

    color: #888;

}

@media(max-width:900px) {

    .stats {

        grid-template-columns:
            repeat(2, 1fr);

    }

}

@media(max-width:650px) {

    .stats {

        grid-template-columns: 1fr;

    }

}

</style>