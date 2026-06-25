import { useState } from "react";
import { unlockMasterKeyWithRecoveryKey } from "src/encryption/utilities";
import { useEncryptionKey } from "src/encryption/encryption-key-context";
import { useToast } from "src/toast/use-toast";


const ForgotEncryptionPasswordForm = ({ onShowPasswordForm }: { onShowPasswordForm: (show: boolean) => void }) => {
    const [recoveryKey, setRecoveryKey] = useState("");
    const { encryptionConfig } = useEncryptionKey();
    const { showToast } = useToast();
    const handleSubmitRecoveryKey = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!encryptionConfig) {
            console.error("Encryption config is not available.");
            showToast("Encryption config is not available. Please try again later.", "error");
            return;
        }
        try {
            await unlockMasterKeyWithRecoveryKey(
                recoveryKey,
                encryptionConfig
            );
        } catch (error) {
            console.error("Failed to unlock master key with recovery key:", error);
            showToast("Failed to reset encryption password. Please check your recovery key and try again.", "error");
            return;
        }
        onShowPasswordForm(true);
    }

    return (
        <div className="encryption-password-form forgot-encryption-password-form">
            <p>
                If you have forgotten your encryption password, you can reset it using your recovery key.
                Unfortunately, if you have lost both your encryption password and your recovery key,
                there is no way to recover your encrypted data.
            </p>
            <input
                type="text"
                name="recoveryKey"
                placeholder="Enter your recovery key"
                onChange={(e) => setRecoveryKey(e.target.value)}
                value={recoveryKey}
                className="encryption-recovery-key-input"
            />
            <button
                type="submit"
                className="settings-btn settings-btn--primary"
                onClick={handleSubmitRecoveryKey}
            >
                Reset Encryption Password
            </button>
        </div>
    )
}

export default ForgotEncryptionPasswordForm;
