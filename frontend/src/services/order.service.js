const API_URL = "http://localhost:3000/api/orders";

import { token } from "../stores/auth.js";

export async function createOrder(deliveryAddressId) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token.value}`

        },

        body: JSON.stringify({

            deliveryAddressId

        })

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message);

    }

    return data;

}

// ---------- My Orders ----------

export async function getMyOrders() {

    const response = await fetch(`${API_URL}/my`, {

        headers: {

            Authorization: `Bearer ${token.value}`

        }

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message);

    }

    return data;

}

// ---------- Order Details ----------

export async function getOrderById(id) {

    const response = await fetch(`${API_URL}/${id}`, {

        headers: {

            Authorization: `Bearer ${token.value}`

        }

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message);

    }

    return data;

}