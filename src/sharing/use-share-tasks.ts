import { API_URL } from 'src/app/constants';
import { authHeaders } from "src/authentication/authentication-api";
import { useCallback, useEffect, useState } from 'react';

export interface InvitedUser {
    invitationId: string;
    recipientEmail: string;
    status: "pending" | "accepted";
    direction: "incoming" | "outgoing";
    emailSentAt: string | null;
    createdAt: string;
    updatedAt: string;
    user: SharedUser | null;
}

export interface SharedUser {
    invitationId: string | null;
    uuid: string;
    displayName: string | null;
    avatarUrl: string | null;
    email: string | null;
    status: "pending" | "accepted";
    direction: "incoming" | "outgoing";
    createdAt: string;
    updatedAt: string;
}

async function ensureSuccessfulResponse(response: Response, fallbackMessage: string) {
    if (response.ok) {
        return;
    }

    const responseText = (await response.text()).trim();
    let serverMessage = '';

    if (responseText) {
        try {
            const data: unknown = JSON.parse(responseText);

            if (typeof data === 'object' && data !== null) {
                const error = 'error' in data ? data.error : undefined;
                const message = 'message' in data ? data.message : undefined;

                if (typeof error === 'string' && error.trim()) {
                    serverMessage = error.trim();
                } else if (typeof message === 'string' && message.trim()) {
                    serverMessage = message.trim();
                }
            } else if (typeof data === 'string') {
                serverMessage = data.trim();
            }
        } catch {
            // Preserve a plain-text server error, but avoid displaying an HTML error page.
            if (!responseText.startsWith('<')) {
                serverMessage = responseText;
            }
        }
    }

    throw new Error(serverMessage || fallbackMessage);
}

const useShareTasks = () => {
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [invitations, setInvitations] = useState<InvitedUser[]>([]);

    const getInvitations = useCallback(async () => {
        const response = await fetch(API_URL + '/task-sharing/invitations', {
            headers: await authHeaders(),
            method: 'GET',
        });
        await ensureSuccessfulResponse(response, 'Failed to load invitations');
        setInvitations(await response.json() as InvitedUser[]);
    }, []);

    const getSharedUsers = useCallback(async () => {
        const response = await fetch(API_URL + '/task-sharing/users', {
            headers: await authHeaders(),
            method: 'GET',
        });
        await ensureSuccessfulResponse(response, 'Failed to load shared users');
        setSharedUsers(await response.json() as SharedUser[]);
    }, []);

    const refreshSharing = useCallback(async () => {
        await Promise.all([getInvitations(), getSharedUsers()]);
    }, [getInvitations, getSharedUsers]);

    const acceptInvitation = async (invitationId: string) => {
        const response = await fetch(API_URL + `/task-sharing/invitations/${invitationId}/accept`, {
            method: 'POST',
            headers: await authHeaders(),
        });
        await ensureSuccessfulResponse(response, 'Failed to accept invitation');
        await refreshSharing();
    };

    const sendInvitation = async (email: string) => {
        const response = await fetch(API_URL + '/task-sharing/send-invitation', {
            method: 'POST',
            headers: await authHeaders(),
            body: JSON.stringify({ email }),
        });
        await ensureSuccessfulResponse(response, 'Failed to send invitation');
        await refreshSharing();
    };

    const declineInvitation = async (invitationId: string) => {
        const response = await fetch(API_URL + `/task-sharing/invitations/${invitationId}/decline`, {
            method: 'POST',
            headers: await authHeaders(),
        });
        await ensureSuccessfulResponse(response, 'Failed to decline invitation');
        await refreshSharing();
    };

    const cancelInvitation = async (invitationId: string) => {
        const response = await fetch(API_URL + `/task-sharing/invitations/${invitationId}/cancel`, {
            method: 'POST',
            headers: await authHeaders(),
        });
        await ensureSuccessfulResponse(response, 'Failed to cancel invitation');
        await refreshSharing();
    };

    const deleteSharedUser = async (userUuid: string) => {
        const response = await fetch(API_URL + `/task-sharing/users/${userUuid}`, {
            method: 'DELETE',
            headers: await authHeaders(),
        });
        await ensureSuccessfulResponse(response, 'Failed to delete shared user');
        await refreshSharing();
    };

    useEffect(() => {
        // This effect synchronizes the hook with the task-sharing API on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void refreshSharing().catch((error: unknown) => {
            console.error('Failed to load task-sharing data:', error);
        });
    }, [refreshSharing]);

    return {
        sharedUsers,
        invitations,
        sendInvitation,
        acceptInvitation,
        declineInvitation,
        cancelInvitation,
        deleteSharedUser,
    };
};

export { useShareTasks };
