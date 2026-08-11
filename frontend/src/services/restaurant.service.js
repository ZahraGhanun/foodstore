const API_URL =
    "http://localhost:3000/api";

import { token } from "../stores/auth.js";


// =====================================
// Public - Get Restaurants
// =====================================

export async function getRestaurants() {

    const response =
        await fetch(`${API_URL}/restaurants`);

    if (!response.ok) {

        throw new Error(
            "Failed to fetch restaurants."
        );

    }

    return response.json();

}


// =====================================
// Public - Get Restaurant By ID
// =====================================

export async function getRestaurantById(id) {

    const response =
        await fetch(
            `${API_URL}/restaurants/${id}`
        );

    if (!response.ok) {

        throw new Error(
            "Failed to fetch restaurant."
        );

    }

    return response.json();

}


// =====================================
// Admin - Get All Restaurants
// =====================================

export async function getAdminRestaurants() {

    const response =
        await fetch(
            `${API_URL}/admin/restaurants`,
            {

                headers: {

                    Authorization:
                        `Bearer ${token.value}`

                }

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data.message ||
            "Failed to load restaurants."

        );

    }


    return data;

}

export async function deactivateRestaurant(id) {

    const response = await fetch(
        `${API_URL}/admin/restaurants/${id}/deactivate`,
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
            data.message || "Failed to deactivate restaurant."
        );
    }

    return data;
}
