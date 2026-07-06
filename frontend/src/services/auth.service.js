const API_URL = "http://localhost:3000/api/auth";

import { token } from "../stores/auth.js";

// ---------- Register ----------

export async function register(userData) {

    const response = await fetch(`${API_URL}/register`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(userData)

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
    }

    return data;

}

// ---------- Login ----------

export async function login(credentials) {

    const response = await fetch(`${API_URL}/login`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(credentials)

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed.");
    }

    return data;

}

// ---------- Get Profile ----------

export async function getProfile() {

    const response = await fetch(`${API_URL}/me`, {

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

// ---------- Update Profile ----------

export async function updateProfile(profile) {

    const response = await fetch(`${API_URL}/me`, {

        method: "PATCH",

        headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token.value}`

        },

        body: JSON.stringify(profile)

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message);

    }

    return data;

}