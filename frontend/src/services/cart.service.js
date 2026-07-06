const API_URL = "http://localhost:3000/api/cart";

export async function addToCart(foodId, quantity = 1) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/items`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            foodId,
            quantity
        })

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart.");
    }

    return data;
}

export async function getCart() {

    const token = localStorage.getItem("token");

    const response = await fetch(API_URL, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart.");
    }

    return data;
}

export async function updateQuantity(itemId, quantity) {

    const token = localStorage.getItem("token");

    const response = await fetch(

        `${API_URL}/items/${itemId}`,

        {

            method: "PATCH",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify({

                quantity

            })

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to update quantity."

        );

    }

    return data;

}

export async function removeItem(itemId) {

    const token = localStorage.getItem("token");

    const response = await fetch(

        `${API_URL}/items/${itemId}`,

        {

            method: "DELETE",

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.message || "Failed to remove item."

        );

    }

    return data;

}