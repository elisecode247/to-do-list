import { API_CHORES_URL } from "app/constants";
import {
    type ChecklistItem,
    type ChoreMember,
    type ChoreMemberRole,
} from "app/types";
import { authHeaders } from "src/authentication/authentication-api";

export type ApiErrorResponse = {
    error: string;
};

export type AddTaskResponse = ChecklistItem | ApiErrorResponse;

export type AddTasksFromTemplateRequest = {
    parent: Omit<ChecklistItem, "id" | "parentUuid">;
    subChores: Omit<ChecklistItem, "id" | "parentUuid">[];
};

export type AddTasksFromTemplateResponse = {
    parent: ChecklistItem;
    subChores: ChecklistItem[];
};

export async function fetchTasks(): Promise<ChecklistItem[]> {
    try {
        const response = await fetch(API_CHORES_URL, {
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

export async function addTask(task: ChecklistItem): Promise<AddTaskResponse> {
    try {
        const response = await fetch(`${API_CHORES_URL}/new`, {
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

export async function addTasksFromTemplate(
    template: AddTasksFromTemplateRequest,
): Promise<AddTasksFromTemplateResponse> {
    try {
        const response = await fetch(`${API_CHORES_URL}/new/from-template`, {
            method: "POST",
            headers: await authHeaders(),
            body: JSON.stringify(template),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to add tasks from template:", err);
        throw err;
    }
}

export async function bulkUpdateTasks(tasks: ChecklistItem[]): Promise<void> {
    try {
        const response = await fetch(`${API_CHORES_URL}/bulk-update`, {
            method: "PUT",
            headers: await authHeaders(),
            body: JSON.stringify({ tasks }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
    } catch (err) {
        console.error("Failed to bulk update tasks:", err);
        throw err;
    }
}

export async function prioritizeTask(task: ChecklistItem): Promise<ChecklistItem> {
    try {
        const response = await fetch(`${API_CHORES_URL}/priority`, {
            method: "PUT",
            headers: await authHeaders(),
            body: JSON.stringify({ id: task.id, priority: task.isPriority }),
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

export async function updateTask(task: ChecklistItem): Promise<ChecklistItem> {
    try {
        const response = await fetch(`${API_CHORES_URL}`, {
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
export async function getChoreMembers(choreUuid: string): Promise<ChoreMember[]> {
    const response = await fetch(`${API_CHORES_URL}/${choreUuid}/members`, {
        method: "GET",
        headers: await authHeaders(),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return await response.json() as ChoreMember[];
}

export async function addChoreMember(
    choreUuid: string,
    userUuid: string,
    role: ChoreMemberRole,
): Promise<ChoreMember> {
    const response = await fetch(`${API_CHORES_URL}/${choreUuid}/members`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ userUuid, role }),
    });

    if (!response.ok) {
        const responseText = (await response.text()).trim();
        let message = '';

        if (responseText) {
            try {
                const data: unknown = JSON.parse(responseText);
                if (typeof data === 'object' && data !== null) {
                    const error = 'error' in data ? data.error : undefined;
                    const detail = 'message' in data ? data.message : undefined;
                    message = typeof error === 'string'
                        ? error
                        : typeof detail === 'string'
                            ? detail
                            : '';
                }
            } catch {
                if (!responseText.startsWith('<')) {
                    message = responseText;
                }
            }
        }

        if (!message) {
            if (response.status === 409) message = 'This user is already a member of the task.';
            else if (response.status === 404) message = 'This task or user is not available.';
            else if (response.status === 400) message = 'Choose a valid user and role.';
            else message = 'Failed to add task member.';
        }

        throw new Error(message);
    }

    return await response.json() as ChoreMember;
}

export async function updateChoreMemberRole(
    choreUuid: string,
    userUuid: string,
    role: ChoreMemberRole,
): Promise<ChoreMember> {
    const response = await fetch(
        `${API_CHORES_URL}/${choreUuid}/members/${encodeURIComponent(userUuid)}`,
        {
            method: "PATCH",
            headers: await authHeaders(),
            body: JSON.stringify({ role }),
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            response.status === 400
                ? 'Choose a valid member role.'
                : response.status === 404
                    ? 'This task member is not available.'
                    : `Failed to update task member${text.trim() ? `: ${text.trim()}` : '.'}`,
        );
    }

    return await response.json() as ChoreMember;
}

export async function deleteChoreMember(
    choreUuid: string,
    userUuid: string,
): Promise<void> {
    const response = await fetch(
        `${API_CHORES_URL}/${choreUuid}/members/${encodeURIComponent(userUuid)}`,
        {
            method: "DELETE",
            headers: await authHeaders(),
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            response.status === 404
                ? 'This task member is not available.'
                : `Failed to remove task member${text.trim() ? `: ${text.trim()}` : '.'}`,
        );
    }
}

export async function updateTasksOrder(
    orders: { id: string; sortOrder?: number, tabSortOrder?: number }[]
): Promise<void> {
    const response = await fetch(`${API_CHORES_URL}/order`, {
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
        const response = await fetch(`${API_CHORES_URL}/${id}`, {
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

export async function toggleHideToday(id: string, hide: boolean): Promise<void> {
    try {
        const response = await fetch(`${API_CHORES_URL}/hideToday`, {
            method: "PUT",
            headers: await authHeaders(),
            body: JSON.stringify({ id, hide }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        await response.json();
    } catch (err) {
        console.error("Failed to toggle 'Not Today'", err);
        throw err;
    }
}
