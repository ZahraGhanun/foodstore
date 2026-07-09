
const API_URL = "http://localhost:3000/api/orders";

import { token } from "../stores/auth.js";


export async function getRestaurantOrders() {

    const response = await fetch(

        `${API_URL}/restaurant/my-orders`,

        {

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to load orders."

        );

    }

    return data;

}

export async function updateOrderStatus(orderId, status) {

    const response = await fetch(

        `${API_URL}/restaurant/my-orders/${orderId}`,

        {

            method: "PATCH",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`

            },

            body: JSON.stringify({

                status

            })

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to update order."

        );

    }

    return data;

}
