const API_URL = "http://localhost:3000/api";

import { token } from "../stores/auth.js";

export async function getMyFoods() {

    const response = await fetch(

        `${API_URL}/restaurant/my-foods`,

        {

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message || "Failed to load foods.");

    }

    return data;

}

export async function createFood(food) {

    const response = await fetch(

        `${API_URL}/restaurant/my-foods`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`

            },

            body: JSON.stringify(food)

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message || "Failed to create food.");

    }

    return data;

}

export async function updateFood(foodId, food) {

    const response = await fetch(

        `${API_URL}/restaurant/my-foods/${foodId}`,

        {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`

            },

            body: JSON.stringify(food)

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message || "Failed to update food.");

    }

    return data;

}

export async function deleteFood(foodId) {

    const response = await fetch(

        `${API_URL}/restaurant/my-foods/${foodId}`,

        {

            method: "DELETE",

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message || "Failed to delete food.");

    }

    return data;

}