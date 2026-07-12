const API_URL = "http://localhost:3000/api/orders";

import { token } from "../stores/auth.js";

export async function getAvailableOrders() {

    const response = await fetch(

        `${API_URL}/driver/available-orders`,

        {

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message ||

            "Failed to load available orders."

        );

    }

    return data;

}

export async function acceptOrder(orderId) {

    const response = await fetch(

        `${API_URL}/driver/orders/${orderId}/accept`,

        {

            method: "PATCH",

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message ||

            "Failed to accept order."

        );

    }

    return data;

}


export async function getMyDeliveries() {

    const response = await fetch(

        `${API_URL}/driver/my-deliveries`,

        {

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message ||

            "Failed to load deliveries."

        );

    }

    return data;

}

export async function deliverOrder(orderId) {

    const response = await fetch(

        `${API_URL}/driver/orders/${orderId}/deliver`,

        {

            method: "PATCH",

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message ||

            "Failed to deliver order."

        );

    }

    return data;

}