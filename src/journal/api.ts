import { authHeaders } from "src/authentication/authentication-api";
import type { JournalEntry } from "./types";
import { API_JOURNAL_URL } from "src/app/constants";

function formatTodayForApi(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export async function fetchJournalEntries(day: string = formatTodayForApi()): Promise<JournalEntry[]> {
    try {
        const params = new URLSearchParams({ day });
        const response = await fetch(`${API_JOURNAL_URL}?${params.toString()}`, {
            method: "GET",
            headers: await authHeaders(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to fetch journal entries:", err);
        throw err;
    }
}

export async function addEntry(entry: JournalEntry): Promise<JournalEntry> {
    try {
        const response = await fetch(`${API_JOURNAL_URL}`, {
            method: "POST",
            headers: await authHeaders(),
            body: JSON.stringify(entry),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to add journal entry:", err);
        throw err;
    }
}

export async function updateEntry(entry: JournalEntry): Promise<void> {
    try {
        const response = await fetch(`${API_JOURNAL_URL}/${entry.id}`, {
            method: "PATCH",
            headers: await authHeaders(),
            body: JSON.stringify(entry),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
    } catch (err) {
        console.error("Failed to update journal entry:", err);
        throw err;
    }
}

export async function deleteEntry(id: string): Promise<void> {
    try {
        const response = await fetch(`${API_JOURNAL_URL}/${id}`, {
            method: "DELETE",
            headers: await authHeaders(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
    } catch (err) {
        console.error("Failed to delete journal entry:", err);
        throw err;
    }
}

