import type { UniqueIdentifier } from "@dnd-kit/core";
import { API_URL } from "app/constants";
import { type ChecklistItem } from "app/types";
import { AUTH_TOKEN_KEY } from "src/authentication/constants";

export async function fetchTasks() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Failed to fetch tasks:", err);
    }
}

export async function addTask(task: ChecklistItem) {
    try {
        const response = await fetch(`${API_URL}/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
            },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        console.log("Added task:", data);
        return data;
    } catch (err) {
        console.error("Failed to add task:", err);
        throw err;
    }
}

export async function updateTask(task: ChecklistItem) {
    try {
        const response = await fetch(`${API_URL}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
            },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Failed to save task:", err);
        throw err;
    }
}

export async function updateTasksOrder(
    orders: { id: UniqueIdentifier; sortOrder: number }[]
) {
    const response = await fetch(`${API_URL}/order`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({ orders }),
    });
    return response.json();
}

export async function deleteTask(id: UniqueIdentifier): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        console.log("Deleted task:", data);
        return data;
    } catch (err) {
        console.error("Failed to delete task:", err);
        throw err;
    }
}
