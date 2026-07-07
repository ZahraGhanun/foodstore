const API_URL = "http://localhost:3000/api/addresses";

import { token } from "../stores/auth.js";

async function request(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token.value}`,

            ...(options.headers || {})

        }

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message);

    }

    return data;

}

export function getAddresses() {

    return request(API_URL);

}

export function createAddress(address) {

    return request(API_URL, {

        method: "POST",

        body: JSON.stringify(address)

    });

}

export function updateAddress(id, address) {

    return request(`${API_URL}/${id}`, {

        method: "PATCH",

        body: JSON.stringify(address)

    });

}

export function deleteAddress(id) {

    return request(`${API_URL}/${id}`, {

        method: "DELETE"

    });

}

export function setDefaultAddress(id) {

    return request(`${API_URL}/${id}/default`, {

        method: "PATCH"

    });

}