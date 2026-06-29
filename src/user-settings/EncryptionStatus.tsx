import { useEncryptionKey } from "src/encryption/encryption-key-context";
import "src/user-settings/EncryptionStatus.css";
import { CircleAlert, Loader, Unlock, Lock } from "lucide-react";
import { useToast } from "src/toast/use-toast";
import ProgressBar from "src/components/progress-bar/ProgressBar";
import { useEncryptionMigration } from "src/encryption/use-encryption-migration";
import JournalLockScreen from "src/journal/JournalLockScreen";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const STATUS_LABELS: Record<string, string> = {
    not_encrypted: "Not Encrypted",
    migrating: "Migrating",
    encrypted: "Encrypted",
    error: "Error"
};

const STATUS_ICONS: Record<string, React.ReactElement> = {
    not_encrypted: <Unlock size={16} />,
    migrating: <Loader size={16} />,
    encrypted: <Lock size={16} />,
    error: <CircleAlert size={16} />
};

function handleTryCatch(fn: () => Promise<void>,
    errorMessage: string, showToast: (message: string, type: "error" | "success") => void) {
    return async () => {
        try {
            await fn();
        } catch (error) {
            console.error(error);
            showToast(errorMessage, "error");
        }
    };
}
const EncryptionStatus = () => {
    const { encryptionStatus } = useEncryptionKey();
    const {
        busy,
        failedEntries,
        processingStep,
        progress,
        start,
        retryFailed,
        commitMigration,
        skipFailed,
        setDialogOpen,
        dialogOpen,
        processBatch
    } = useEncryptionMigration();

    const { showToast } = useToast();

    const handleEnableEncryption = handleTryCatch(start, "Failed to start encryption migration. Please try again later.", showToast);
    const handleCommitMigration = handleTryCatch(commitMigration, "Failed to commit encryption migration. Please try again later.", showToast);
    const handleRetryFailed = handleTryCatch(retryFailed, "Failed to retry failed entries. Please try again later.", showToast);
    const handleSkipFailed = handleTryCatch(skipFailed, "Failed to skip failed entries. Please try again later.", showToast);
    const handleContinueEncryption = handleTryCatch(processBatch, "Failed to continue encryption migration. Please try again later.", showToast);


    return (
        <div className="encryption-status-container">
            <div className="encryption-status-header">
                <h4 className="settings-section-title">
                    Journal Encryption Status
                </h4>

                <div
                    className={`encryption-status encryption-status--${encryptionStatus} ${busy && encryptionStatus === 'migrating' ? 'encryption-status--loading' : ''}`
                    }
                >
                    {STATUS_ICONS[encryptionStatus]}
                    {STATUS_LABELS[encryptionStatus]}
                </div>
            </div>

            {/* ---------- NOT ENCRYPTED ---------- */}

            {encryptionStatus === "not_encrypted" && (
                <>
                    <p>
                        Your journal is not encrypted. Encrypt your existing
                        journal entries to protect them.
                    </p>

                    <button
                        disabled={busy}
                        className="settings-btn start-encryption-button"
                        onClick={handleEnableEncryption}
                    >
                        Begin Encryption
                    </button>
                </>
            )}

            {/* ---------- MIGRATING ---------- */}

            {encryptionStatus === "migrating" && (
                <>
                    {processingStep === 'not_started' ? (
                        <>
                            <p>
                                Begin the process of encrypting your journal entries. This may take a few moments.
                            </p>
                            <p>
                                This will start the encryption process for your existing journal entries.
                            </p>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleEnableEncryption}>
                                Enable Encryption
                            </button>
                        </>
                    ) : processingStep === 'processing_batch' ? (
                        <>
                            <p>
                                Encrypt a batch of your journal entries. This may take a few moments.
                            </p>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleContinueEncryption}>
                                Continue Encryption
                            </button>
                        </>
                    ) : processingStep === 'committing' ? (
                        <>
                            <p>
                                Encrypted entries ready for to be saved to the server.
                            </p>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleCommitMigration}>
                                Commit Changes
                            </button>
                        </>
                    ) : processingStep === 'completed' ? (
                        <>
                            <p>
                                Encryption completed successfully.
                            </p>
                        </>
                    ) : processingStep === 'retry_encrypt' ? (
                        <>
                            <p>
                                Errors occurred during encryption. You can retry the failed entries or skip them.
                            </p>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleRetryFailed}>
                                Retry Failed
                            </button>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleSkipFailed}>
                                Skip Failed
                            </button>
                        </>
                    ) : processingStep === 'retry_commit' ? (
                        <>
                            <p>
                                Errors occurred during commit. You can retry the failed entries or skip them.
                            </p>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleRetryFailed}>
                                Retry Commit
                            </button>
                            <button disabled={busy} className="settings-btn start-encryption-button" onClick={handleSkipFailed}>
                                Skip Commit
                            </button>

                        </>
                    ) : null}
                    <div className="encryption-progress">
                        <div>
                            {progress.processed} of {progress.total} entries
                        </div>

                        <div>{progress.percent}%</div>
                    </div>
                    <ProgressBar progress={progress.percent} />
                    {failedEntries && failedEntries.length > 0 && (
                        <>
                            <div className="failed-entries">
                                <h5>Failed Entries (Count: {failedEntries.length})</h5>
                                <div className="table-overflow-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Entry ID</th>
                                                <th>Date</th>
                                                <th>Content</th>
                                                <th>Error</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {failedEntries.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td className="failed-entry-column">{entry.id}</td>
                                                    <td className="failed-entry-column">{entry.day}</td>
                                                    <td className="failed-entry-column">{entry.text.slice(0, 100)}</td>
                                                    <td className="failed-entry-column">{entry.error}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <button className="settings-btn retry-failed-button" onClick={handleRetryFailed}>
                                Retry Failed Entries
                            </button>
                            <button className="settings-btn skip-failed-button" onClick={handleSkipFailed}>
                                Skip Failed Entries
                            </button>
                        </>
                    )}
                </>
            )}

            {/* ---------- COMPLETE ---------- */}

            {encryptionStatus === "encrypted" && (
                <p>
                    All journal entries have been encrypted successfully.
                </p>
            )}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogBackdrop className="recovery-key-backdrop" />
                <DialogPanel className="unlock-dialog-panel">
                    <JournalLockScreen />
                </DialogPanel>
            </Dialog>
        </div>
    );
};

export default EncryptionStatus;
