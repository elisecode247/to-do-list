import React from 'react';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import './delete-account-Dialog.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import { deleteAccount, verifyGoogleReauth } from 'src/authentication/authentication-api';
import { useToast } from 'src/toast/use-toast';
import { useLocation } from "wouter";

const DeleteAccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [isConfirmed, setIsConfirmed] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const { startGoogleReauth, logout } = useAuthentication();
    const { showToast } = useToast();
    const [, setLocation] = useLocation();

    React.useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsConfirmed(false);
            setIsDeleting(false);
            setErrorMessage(null);
        }
    }, [isOpen]);

    async function handleDelete() {
        if (!isConfirmed || isDeleting) return;

        setIsDeleting(true);
        setErrorMessage(null);

        try {
            // 1) Force Google reauth and get token
            const token = await startGoogleReauth();

            // 2) Verify reauth on backend
            await verifyGoogleReauth(token);

            // 3) Perform destructive action
            await deleteAccount();
            logout();
            showToast('Account deleted successfully.', 'success');

            setLocation("/");
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Account deletion failed';
            setErrorMessage(message);
            showToast(message, 'error');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="delete-dialog-container">
            <DialogBackdrop className="delete-dialog-backdrop" />
            <DialogPanel className="delete-dialog-panel">
                <DialogTitle className="delete-dialog__title">Delete account</DialogTitle>
                <Description>This will permanently delete your account</Description>
                <p className="delete-dialog-p">Are you sure you want to delete your account? All of your data will be permanently removed.</p>
                <p className="delete-dialog-warning">
                    <strong>Shared chores:</strong> Any shared chores you own will permanently disappear from your collaborators&apos; lists.
                </p>

                {errorMessage && <p className="delete-dialog-error">{errorMessage}</p>}

                <input
                    type="checkbox"
                    id="confirm-deletion"
                    name="confirm-deletion"
                    checked={isConfirmed}
                    disabled={isDeleting}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <label htmlFor="confirm-deletion">I understand that deleted accounts aren't recoverable</label>

                <div className="dialog-footer">
                    <button className="settings-btn" onClick={onClose} disabled={isDeleting}>Cancel</button>
                    <button className="settings-btn settings-btn--primary"
                        disabled={!isConfirmed || isDeleting}
                        onClick={handleDelete}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </DialogPanel>
        </Dialog >
    );
};

export default DeleteAccountModal;
