const API_URL = "http://localhost:3000/api";

import { token } from "../stores/auth.js";

export async function getMyCategories() {

    const response = await fetch(

        `${API_URL}/categories/my`,

        {

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to load categories."

        );

    }

    return data;

}

export async function createCategory(category) {

    const response = await fetch(

        `${API_URL}/restaurant/my-categories`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`

            },

            body: JSON.stringify(category)

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to create category."

        );

    }

    return data;

}

export async function updateCategory(categoryId, category) {

    const response = await fetch(

        `${API_URL}/restaurant/my-categories/${categoryId}`,

        {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`

            },

            body: JSON.stringify(category)

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to update category."

        );

    }

    return data;

}




export async function deleteCategory(categoryId) {

    const response = await fetch(

        `${API_URL}/restaurant/my-categories/${categoryId}`,

        {

            method: "DELETE",

            headers: {

                Authorization: `Bearer ${token.value}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to delete category."

        );

    }

    return data;

}


