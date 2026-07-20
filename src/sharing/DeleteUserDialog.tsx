import React from 'react';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import './delete-user-Dialog.css';

type DeleteUserDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
};

const DeleteUserDialog = ({ isOpen, onClose, onDelete }: DeleteUserDialogProps) => {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = React.useState(false);

    async function handleDelete() {
        if (isDeleting) return;

        setIsDeleting(true);
        setErrorMessage(null);

        try {
            await onDelete();
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Shared user deletion failed';
            setErrorMessage(message);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="delete-dialog-container">
            <DialogBackdrop className="delete-dialog-backdrop" />
            <DialogPanel className="delete-dialog-panel">
                <DialogTitle className="delete-dialog__title">Delete shared user</DialogTitle>
                <Description className="delete-dialog-p">Are you sure you want to delete this shared user? All of the shared tasks will be permanently removed and cannot be undone.</Description>

                {errorMessage && <p className="delete-dialog-error">{errorMessage}</p>}

                <input
                    type="checkbox"
                    id="confirm-deletion"
                    name="confirm-deletion"
                    checked={isConfirmed}
                    disabled={isDeleting}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <label htmlFor="confirm-deletion">I understand that deleting shared users isn't recoverable.</label>

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

export default DeleteUserDialog;
