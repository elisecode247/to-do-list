import { API_URL } from 'src/app/constants';
import { authHeaders } from "src/authentication/authentication-api";
import { useState, useEffect } from 'react';

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

export const invitedUsers: InvitedUser[] = [
    {
        "invitationId": "56b9c982-aa16-4c83-8a0c-e8133023fed8",
        "recipientEmail": "elisestraub5211@gmail.com",
        "status": "pending",
        "direction": "outgoing",
        "emailSentAt": null,
        "createdAt": "2026-07-19T23:52:26.982Z",
        "updatedAt": "2026-07-19T23:52:26.982Z",
        "user": null
    }
]
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

const useShareTasks = () => {
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [invitations, setInvitations] = useState<InvitedUser[]>([]);

    const getInvitations = async () => {
        return fetch(API_URL + '/task-sharing/invitations', {
            headers: await authHeaders(),
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => setInvitations(data));
    };
    const getSharedUsers = async () => {
        return fetch(API_URL + '/task-sharing/users', {
            headers: await authHeaders(),
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => setSharedUsers(data));
    };
    const acceptInvitation = async (invitationId: string) => {
        return fetch(API_URL + `/task-sharing/invitations/${invitationId}/accept`, {
            method: 'POST',
            headers: await authHeaders(),
        }).then((response) => {
            return response.json();
        }).catch((error) => {
            console.error('Error accepting invitation:', error);
            throw error;
        }).finally(() => {
            getSharedUsers();
        });
    };
    const sendInvitation = async (email: string) => {
        return fetch(API_URL + '/task-sharing/send-invitation', {
            method: 'POST',
            headers: await authHeaders(),
            body: JSON.stringify({ email }),
        }).then((response) => {
            return response.json();
        }).catch((error) => {
            console.error('Error sending invitation:', error);
            throw error;
        }).finally(() => {
            getSharedUsers();
        });
    };

    const declineInvitation = async (invitationId: string) => {
        return fetch(API_URL + `/task-sharing/invitations/${invitationId}/decline`, {
            method: 'POST',
            headers: await authHeaders(),
        }).then((response) => {
            return response.json();
        }).catch((error) => {
            console.error('Error declining invitation:', error);
            throw error;
        }).finally(() => {
            getSharedUsers();
        });
    };
    const cancelInvitation = async (invitationId: string) => {
        return fetch(API_URL + `/task-sharing/invitations/${invitationId}/cancel`, {
            method: 'POST',
            headers: await authHeaders(),
        }).then((response) => {
            return response.json();
        }).catch((error) => {
            console.error('Error canceling invitation:', error);
            throw error;
        }).finally(() => {
            getSharedUsers();
        });
    };


    useEffect(() => {
        getInvitations();
        getSharedUsers();
    }, []);

    return {
        sharedUsers,
        invitations,
        sendInvitation,
        acceptInvitation,
        declineInvitation,
        cancelInvitation
    };
};

export { useShareTasks };
