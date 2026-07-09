const API_URL = "http://localhost:3000/api/restaurant-dashboard";

import { token } from "../stores/auth.js";

export async function getDashboard() {

    const response = await fetch(API_URL, {

        headers: {

            Authorization: `Bearer ${token.value}`

        }

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message || "Failed to load dashboard.");

    }

    return data;

}