const API_URL = "http://localhost:3000/api";

import { token } from "../stores/auth.js";


export async function createReview(orderItemId, review) {

    const response = await fetch(
        `${API_URL}/reviews/${orderItemId}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token.value}`
            },

            body: JSON.stringify(review)
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Failed to create review."
        );

    }


    return data;

}


export async function getMyReviews() {

    const response = await fetch(
        `${API_URL}/reviews/my`,
        {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Failed to load reviews."
        );

    }


    return data;

}