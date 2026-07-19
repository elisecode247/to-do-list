import { API_URL } from 'src/app/constants';
import { authHeaders } from "src/authentication/authentication-api";
import { useState, useEffect } from 'react';

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
        getSharedUsers();
    }, []);

    return {
        sendInvitation,
        sharedUsers,
        acceptInvitation,
        declineInvitation,
        cancelInvitation
    };
};

export { useShareTasks };
