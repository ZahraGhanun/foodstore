const API_URL = "http://localhost:3000/api";

import { token } from "../stores/auth.js";

export async function getAddresses() {

    const response = await fetch(

        `${API_URL}/addresses`,

        {

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    if (!response.ok) {

        throw new Error("Failed to fetch addresses.");

    }

    return response.json();

}

export async function createAddress(data) {

    const response = await fetch(

        `${API_URL}/addresses`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`

            },

            body: JSON.stringify(data)

        }

    );

    if (!response.ok) {

        throw new Error("Failed to create address.");

    }

    return response.json();

}

export async function deleteAddress(id) {

    const response = await fetch(

        `${API_URL}/addresses/${id}`,

        {

            method: "DELETE",

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    if (!response.ok) {

        throw new Error("Failed to delete address.");

    }

    return response.json();

}

export async function setDefaultAddress(id) {

    const response = await fetch(

        `${API_URL}/addresses/${id}/default`,

        {

            method: "PATCH",

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    if (!response.ok) {

        throw new Error("Failed to set default address.");

    }

    return response.json();

}