const API_URL = "http://localhost:3000/api";

export async function getRestaurants() {
    const response = await fetch(`${API_URL}/restaurants`);

    if (!response.ok) {
        throw new Error("Failed to fetch restaurants.");
    }

    return response.json();
}

export async function getRestaurantById(id) {

    const response = await fetch(
        `${API_URL}/restaurants/${id}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch restaurant.");
    }

    return response.json();
}