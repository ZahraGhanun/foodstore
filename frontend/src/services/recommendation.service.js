const API_URL = "http://localhost:3000/api/recommendations";

export async function getRecommendations() {

    const token = localStorage.getItem("token");

    const response = await fetch(API_URL, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message || "Failed to fetch recommendations."
        );

    }

    return data;
}