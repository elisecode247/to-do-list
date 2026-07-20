import { useState } from 'react';
import './sharing-settings.css';
import { useShareTasks } from 'src/sharing/use-share-tasks';
import DeleteUserDialog from 'src/sharing/DeleteUserDialog';
import { useToast } from 'src/toast/use-toast';

function getErrorMessage(error: unknown, fallbackMessage: string) {
    return error instanceof Error ? error.message : fallbackMessage;
}

const SharingSettings = function () {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
    const { showToast } = useToast();
    const closeDeleteConfirmation = () => {
        setSelectedUserUuid(null);
    };
    const {
        invitations,
        sharedUsers,
        acceptInvitation,
        sendInvitation,
        cancelInvitation,
        declineInvitation,
        deleteSharedUser,
    } = useShareTasks();
    const pendingIncomingInvitations = invitations.filter(user => user.direction === 'incoming' && user.status === 'pending');
    const pendingOutgoingInvitations = invitations.filter(user => user.direction === 'outgoing' && user.status === 'pending');
    const acceptedInvitations = sharedUsers.filter(user => user.status === 'accepted');

    const handleInvitationAction = async (
        action: () => Promise<void>,
        successMessage: string,
        failureMessage: string,
    ) => {
        try {
            await action();
            showToast(successMessage, 'success');
        } catch (actionError) {
            showToast(getErrorMessage(actionError, failureMessage), 'error');
        }
    };

    const sendEmail = async () => {
        if (!email.length) {
            setError('Please enter an email address.');
            return;
        }
        if (!email.endsWith('@gmail.com')) {
            setError('Please enter a valid Google email address.');
            return;
        }
        setIsSending(true);
        setSent(false);

        try {
            await sendInvitation(email);
            setSent(true);
            setEmail('');
            showToast('Invitation sent.', 'success');
        } catch (sendError) {
            const message = getErrorMessage(sendError, 'Failed to send invitation');
            setError(message);
            showToast(message, 'error');
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteSharedUser = async (userUuid: string) => {
        try {
            await deleteSharedUser(userUuid);
            showToast('Shared user deleted successfully.', 'success');
        } catch (deleteError) {
            showToast(getErrorMessage(deleteError, 'Shared user deletion failed'), 'error');
            throw deleteError;
        }
    };

    return (
        <>
            {pendingIncomingInvitations?.length > 0 && (
                <section className="settings-section">
                    <h3 className="settings-section-title">Pending Invitations</h3>
                    <p className="settings-section-description">
                        Here you can see the invitations you have received from other users.
                    </p>
                    <div className="shared-users-list">
                        {pendingIncomingInvitations.map((user) => (
                            <div className="shared-user-item" key={user.recipientEmail}>
                                <span className="shared-user-name">{user.recipientEmail}</span>
                                <span className="shared-user-status">(Pending)</span>
                                <div className="shared-user-actions">
                                    <button
                                        className="settings-btn shared-user-item-accept-btn"
                                        type="button"
                                        onClick={() => void handleInvitationAction(
                                            () => acceptInvitation(user.invitationId),
                                            'Invitation accepted.',
                                            'Failed to accept invitation',
                                        )}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="settings-btn shared-user-item-decline-btn"
                                        type="button"
                                        onClick={() => void handleInvitationAction(
                                            () => declineInvitation(user.invitationId),
                                            'Invitation declined.',
                                            'Failed to decline invitation',
                                        )}
                                    >
                                        Decline
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <section className="settings-section">
                <h3 className="settings-section-title">Share Tasks</h3>
                <p className="settings-section-description">
                    You can share your tasks with other users by entering their email addresses below.
                    Must be a valid google email address.
                </p>
                <input
                    disabled={isSending}
                    type="email"
                    className="settings-input"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                        setError('');
                        setEmail(e.target.value)
                    }}
                />
                <button
                    className="settings-btn"
                    type="button"
                    onClick={() => void sendEmail()}
                    disabled={email.length === 0 || isSending}
                >
                    Share
                </button>
                {error && (
                    <p className="settings-error-message">
                        {error}
                    </p>
                )}
                {sent && (
                    <p className="settings-success-message">
                        Invitation processing. If the email address is valid and
                        has an account associated with this website,
                        they will receive an email notification.
                    </p>
                )}
                <div className="shared-users-list">
                    <h3 className="settings-section-title">Shared Users</h3>
                    {acceptedInvitations.length === 0 && pendingOutgoingInvitations.length === 0 && (
                        <p className="settings-info-message">No shared users.</p>
                    )}
                    {pendingOutgoingInvitations.map((user) => (
                        <p className="shared-user-item" key={user.recipientEmail}>
                            <span className="shared-user-email">{user.recipientEmail}</span>
                            <span className="shared-user-status">(Pending)</span>
                            <button
                                className="shared-user-item-cancel-btn"
                                type="button"
                                onClick={() => void handleInvitationAction(
                                    () => cancelInvitation(user.invitationId),
                                    'Invitation canceled.',
                                    'Failed to cancel invitation',
                                )}
                            >
                                Cancel
                            </button>
                        </p>
                    ))}
                    {acceptedInvitations.map((user) => (
                        <p className="shared-user-item" key={user.email}>
                            {!!user.avatarUrl && (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.displayName || 'Avatar'}
                                    className="shared-user-avatar"
                                />
                            )}
                            {user.displayName ? (
                                <span className="shared-user-name">{user.displayName}</span>
                            ) : null}
                            {user.email}
                            {user.status === 'accepted' && (
                                <button
                                    className="settings-btn shared-user-item-delete-btn"
                                    type="button"
                                    onClick={() => {
                                        setSelectedUserUuid(user.uuid);
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </p>
                    ))}
                </div>
                {!!selectedUserUuid && (
                    <DeleteUserDialog
                        isOpen={!!selectedUserUuid}
                        onClose={closeDeleteConfirmation}
                        onDelete={() => handleDeleteSharedUser(selectedUserUuid)}
                    />
                )}
            </section>
        </>
    );
}

export default SharingSettings;
