import { API_URL } from "app/constants";
import { type ChecklistItem } from "app/types";
import { authHeaders } from "src/authentication/authentication-api";

export async function fetchTasks(): Promise<ChecklistItem[]> {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: await authHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to fetch tasks:", err);
        throw err;
    }
}

export async function addTask(task: ChecklistItem): Promise<ChecklistItem> {
    try {
        const response = await fetch(`${API_URL}/new`, {
            method: "POST",
            headers: await authHeaders(),
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to add task:", err);
        throw err;
    }
}

export async function updateTask(task: ChecklistItem): Promise<ChecklistItem> {
    try {
        const response = await fetch(`${API_URL}`, {
            method: "PUT",
            headers: await authHeaders(),
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to save task:", err);
        throw err;
    }
}

export async function updateTasksOrder(
    orders: { id: string; sortOrder: number }[]
): Promise<void> {
    const response = await fetch(`${API_URL}/order`, {
        method: "PUT",
        headers: await authHeaders(),
        body: JSON.stringify({ orders }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
    }
    if (response.status === 204) return;
    return response.json();
}

export async function deleteTask(id: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: await authHeaders(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        await response.json();
    } catch (err) {
        console.error("Failed to delete task:", err);
        throw err;
    }
}
