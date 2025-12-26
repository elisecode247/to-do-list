import type { UniqueIdentifier } from "@dnd-kit/core";
import { API_URL } from "app/constants";
import { type ChecklistItem } from "app/types";

export async function fetchChores() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Chores:", data);
    return data;
  } catch (err) {
    console.error("Failed to fetch chores:", err);
  }
}

export async function postChores(chores: ChecklistItem[]) {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chores),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log("Saved chores:", data);
    return data;
  } catch (err) {
    console.error("Failed to save chores:", err);
    throw err;
  }
}

export async function updateChore(chore: ChecklistItem) {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chore),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log("Saved chore:", data);
    return data;
  } catch (err) {
    console.error("Failed to save chore:", err);
    throw err;
  }
}

export async function updateChoresOrder(orders: { id: UniqueIdentifier, sortOrder: number }[]) {
  const response = await fetch(`${API_URL}/order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders })
  });
  return response.json();
}
