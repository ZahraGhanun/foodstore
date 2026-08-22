const API_URL = "http://localhost:3000/api";

export async function getPendingDriverRequests(token) {

    const response = await fetch(
        `${API_URL}/driver-registration/pending`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch driver requests."
        );
    }

    return response.json();
}


export async function reviewDriverRequest(
    id,
    status,
    adminMessage,
    token
) {

    const response = await fetch(
        `${API_URL}/driver-registration/${id}/review`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                status,
                adminMessage
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to review driver request."
        );
    }

    return response.json();
}