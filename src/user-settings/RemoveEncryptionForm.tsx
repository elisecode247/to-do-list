import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from "react";
import { useEncryptionKey } from "src/encryption/encryption-key-context";
import "src/user-settings/remove-encryption-form.css";
import { unlockMasterKey } from "src/encryption/utilities";
import { useToast } from "src/toast/use-toast";
import type { JournalEntry } from 'src/journal/types';

interface RemoveEncryptionFormProps {
    onCloseForm: () => void;
    isFormOpen: boolean;
}
const RemoveEncryptionForm = ({ onCloseForm, isFormOpen }: RemoveEncryptionFormProps) => {
    const { decryptAllEntries, removeEncryption, encryptionConfig } = useEncryptionKey();
    const [isRemoving, setIsRemoving] = useState(false);
    const [password, setPassword] = useState("");
    const [showSkippedEntries, setShowSkippedEntries] = useState(false);
    const [skippedEntries, setSkippedEntries] = useState<JournalEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const handleRemoveEncryption = async () => {
        // validate password before proceeding
        if (!password) {
            setError("Please enter your password to confirm.");
            return;
        }
        if (!encryptionConfig) {
            showToast("Encryption configuration is not available.", "error");
            return;
        }
        // unlock the master key with the provided password before removing encryption
        try {
            await unlockMasterKey(password, encryptionConfig);
        } catch (error) {
            console.error("Error unlocking master key:", error);
            setError("Invalid password. Please try again.");
            return;
        }
        setIsRemoving(true);
        try {
            const skippedEntries = await decryptAllEntries(password, encryptionConfig);
            if (skippedEntries.length > 0) {
                setSkippedEntries(skippedEntries);
                setShowSkippedEntries(true);
                setIsRemoving(false);
                return;
            }
            await removeEncryption();
            onCloseForm();
            showToast("Encryption removed successfully.", "success");
        } catch (error) {
            console.error("Error removing encryption:", error);
            setError("Failed to remove encryption. Please try again.");
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <>
            <Dialog
                open={isFormOpen}
                onClose={onCloseForm}
                className="remove-encryption-dialog-container"
            >
                <DialogBackdrop className="remove-encryption-dialog-backdrop" />
                <DialogPanel className="remove-encryption-dialog-panel">
                    {isRemoving ? (
                        <>
                            <Description className="remove-encryption-dialog-p">
                                Depending on the size of your journal, this process may take a few moments.
                                Please do not close the window or navigate away until the process is complete.
                            </Description>
                            <div className="spinner"></div>
                        </>
                    ) : (
                        <>
                            <DialogTitle className="remove-encryption-dialog__title">Remove Encryption</DialogTitle>
                            <Description className="remove-encryption-dialog-p">
                                Are you sure you want to remove encryption?
                                This will make your journal data accessible without a password.
                                Enter your password to confirm.
                            </Description>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="password-input"

                            />
                            {error && <p className="remove-encryption-dialog-error">{error}</p>}
                            <div className="action-buttons">
                                <button
                                    type="button"
                                    className="settings-btn settings-btn--danger"
                                    onClick={handleRemoveEncryption}
                                    disabled={isRemoving}
                                >
                                    {isRemoving ? "Removing..." : "Confirm Remove Encryption"}
                                </button>
                                <button
                                    type="button"
                                    className="settings-btn"
                                    onClick={onCloseForm}
                                    disabled={isRemoving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                    {showSkippedEntries && (
                        <div className="skipped-entries">
                            <p>Decryption was cancelled.</p>
                            <p>These entries could not be decrypted:</p>
                            <table className="skipped-entry">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Entry</th>
                                        <th>Date Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skippedEntries.map((entry, index) => (
                                        <tr key={entry.id}>
                                            <td><strong>{index + 1}</strong></td>
                                            <td>{entry.id}</td>
                                            <td>{new Date(entry.entryTime).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DialogPanel>
            </Dialog>
        </>
    );
};

export default RemoveEncryptionForm;
