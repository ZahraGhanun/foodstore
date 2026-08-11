import { token } from "../stores/auth.js";

const API_URL =
    "http://localhost:3000/api/restaurant-registration";


// ==============================
// Get Pending Requests
// ==============================

export async function getPendingRequests() {

    const response = await fetch(
        `${API_URL}/pending`,
        {
            headers: {
                Authorization:
                    `Bearer ${token.value}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load restaurant requests."
        );

    }

    return data;

}


// ==============================
// Review Request
// ==============================

export async function reviewRequest(
    requestId,
    status,
    adminMessage
) {

    const response = await fetch(
        `${API_URL}/${requestId}/review`,
        {
            method: "PATCH",

            headers: {

                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token.value}`

            },

            body: JSON.stringify({

                status,

                adminMessage

            })

        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to review restaurant request."
        );

    }

    return data;

}