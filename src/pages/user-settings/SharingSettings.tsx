import { useState } from 'react';
import './sharing-settings.css';
import { useShareTasks } from 'src/sharing/use-share-tasks';


const SharingSettings = function () {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const {
        sharedUsers,
        acceptInvitation,
        sendInvitation,
        cancelInvitation,
        declineInvitation
    } = useShareTasks();
    const pendingIncomingInvitations = sharedUsers.filter(user => user.direction === 'incoming' && user.status === 'pending');
    const acceptedAndOutgoingInvitations = sharedUsers.filter(user => (user.direction === 'outgoing' && user.status === 'pending') || user.status === 'accepted');
    const sendEmail = () => {
        if (!email.length) {
            setError('Please enter an email address.');
            return;
        }
        if (!email.endsWith('@gmail.com')) {
            setError('Please enter a valid Google email address.');
            return;
        }
        setIsSending(true);
        sendInvitation(email)
            .finally(() => setIsSending(false))
            .then(() => setSent(true))
            .catch((err) => {
                console.error(err);
                setError(err);
            });
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
                            <div className="shared-user-item" key={user.email}>
                                {!!user.avatarUrl && (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.displayName || 'Avatar'}
                                        className="shared-user-avatar"
                                    />
                                )}
                                <span className="shared-user-name">{user.email}</span>
                                <span className="shared-user-status">(Pending)</span>
                                <div className="shared-user-actions">
                                    <button
                                        className="settings-btn shared-user-item-accept-btn"
                                        type="button"
                                        onClick={() => acceptInvitation(user.invitationId!)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="settings-btn shared-user-item-decline-btn"
                                        type="button"
                                        onClick={() => declineInvitation(user.invitationId!)}
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
                    onClick={sendEmail}
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
                    {acceptedAndOutgoingInvitations.length === 0 && (
                        <p className="settings-info-message">No shared users.</p>
                    )}
                    {acceptedAndOutgoingInvitations.map((user) => (
                        <p className="shared-user-item" key={user.email}>
                            {!!user.avatarUrl && (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.displayName || 'Avatar'}
                                    className="shared-user-avatar"
                                />
                            )}
                            {user.displayName ? (
                                <span className="shared-user-name">{user.displayName || user.email}</span>
                            ) : null}
                            {user.email} {user.direction === 'outgoing' && user.status === 'pending' && (
                                <span className="shared-user-status">(Pending)</span>
                            )}
                            {user.status === 'pending' && user.direction === 'outgoing' && (
                                <button
                                    className="shared-user-item-cancel-btn"
                                    type="button"
                                    onClick={() => cancelInvitation(user.invitationId!)}
                                >
                                    Cancel
                                </button>
                            )}
                        </p>
                    ))}
                </div>
            </section>
        </>
    );
}

export default SharingSettings;
