import { API_AUTH_URL } from "app/constants";

export async function loginWithGoogle(token: string) {
    try {
        const response = await fetch(`${API_AUTH_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        console.log("%c Line:19 🍏 data", "color:#ea7e5c", data);
        localStorage.setItem("authToken", data.token);
    } catch (err) {
        console.error("Failed to authenticate:", err);
        throw err;
    }
}
