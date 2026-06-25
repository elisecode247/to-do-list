import { useState } from 'react';
import { generateMasterKey, deriveKey, generateRecoveryKey } from 'src/encryption/utilities';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { unlockMasterKey, InvalidPasswordError } from 'src/encryption/utilities';
import { useToast } from 'src/toast/use-toast';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import CopyButton from 'src/components/copy-button/CopyButton';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';

type ChangeEncryptionPasswordFormInputs = {
    oldPassword: string;
    password1: string;
    password2: string;
};
/**
 * 
  @description 1: user enters old password and new password
            2: browser unlocks master key to confirm old password is correct
            3: browser creates new recovery key
            4: sends all the encrypted encryption configuration to server using existing PUT /encryption-setup endpoint
            5: show new recovery key to user and tell user to keep it safe
 */
const ChangeEncryptionPasswordForm = () => {
    "use no memo";
    const [showRecoveryKey, setShowRecoveryKey] = useState(false);
    const [confirmedRecoveryKey, setConfirmedRecoveryKey] = useState(false);
    const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
    const { encryptionConfig, setupEncryption, isEncryptionEnabled } = useEncryptionKey();
    const { showToast } = useToast();
    const { register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ChangeEncryptionPasswordFormInputs>({
        mode: 'onBlur', reValidateMode: 'onSubmit', criteriaMode: 'all', shouldFocusError: true, shouldUnregister: false,
        defaultValues: {
            password1: "",
            password2: "",
        },
    });
    const password = useWatch({ name: 'password1', control: control });
    const onSubmit: SubmitHandler<ChangeEncryptionPasswordFormInputs> = async (data) => {
        if (!isEncryptionEnabled) {
            showToast("Encryption is not enabled on your account.", "error");
            return;
        }
        let masterKey: ArrayBuffer | null = null;
        let masterKeySalt: Uint8Array | null = null;
        let masterKeyIv: Uint8Array | null = null;
        let encryptedMasterKeyWithRecovery: ArrayBuffer | null = null;
        let recoveryKey: string | null = null;
        let recoverySalt: Uint8Array | null = null;
        let recoveryIv: Uint8Array | null = null;
        let encryptedMasterKeyWithPassword: ArrayBuffer | null = null;

        // test if current password is able to unlock the master key, if not, show error
        try {
            if (!encryptionConfig) {
                throw new Error("Encryption config is not available.");
            }
            await unlockMasterKey(data.oldPassword, encryptionConfig);

        } catch (err) {
            if (err instanceof InvalidPasswordError) {
                showToast("Incorrect password, please try again.", "error");
            } else {
                showToast("Something went wrong unlocking your vault.", "error");
                console.error(err);
            }
            return;
        }
        try {
            // --- core randomness ---
            masterKey = generateMasterKey();
            masterKeyIv = crypto.getRandomValues(new Uint8Array(12));
            masterKeySalt = crypto.getRandomValues(new Uint8Array(16));

            // --- derive password key ---
            const passwordKey = await deriveKey(data.password1, masterKeySalt);

            // --- encrypt master key with password ---
            encryptedMasterKeyWithPassword = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: masterKeyIv as BufferSource,
                },
                passwordKey,
                masterKey
            );

            // --- recovery setup ---
            recoveryKey = generateRecoveryKey(24);
            recoveryIv = crypto.getRandomValues(new Uint8Array(12));
            recoverySalt = crypto.getRandomValues(new Uint8Array(16));

            const recoveryCryptoKey = await deriveKey(recoveryKey, recoverySalt);

            // --- encrypt master key with recovery ---
            encryptedMasterKeyWithRecovery = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: recoveryIv as BufferSource,
                },
                recoveryCryptoKey,
                masterKey
            );
            // --- verify encryption ---
            try {
                await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: masterKeyIv as BufferSource },
                    passwordKey,
                    encryptedMasterKeyWithPassword
                );

                await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: recoveryIv as BufferSource },
                    recoveryCryptoKey,
                    encryptedMasterKeyWithRecovery
                );

            } catch (error) {
                throw new Error("Encryption verification failed.", { cause: error });
            }

            // --- UI state ---
            setRecoveryKey(recoveryKey);

        } catch (error) {
            console.error("Error during encryption setup:", error);

            showToast("Encryption setup failed. Try again.", "error");

        }
        // send request to server to change password
        try {
            if (!encryptedMasterKeyWithPassword || !masterKeySalt || !masterKeyIv || !encryptedMasterKeyWithRecovery || !recoverySalt || !recoveryIv) {
                throw new Error("Missing encryption data");
            }
            await setupEncryption({
                version: 1,
                passwordProtector: {
                    wrappedKey: encryptedMasterKeyWithPassword,
                    iv: masterKeyIv,
                    salt: masterKeySalt
                },
                recoveryProtector: {
                    wrappedKey: encryptedMasterKeyWithRecovery,
                    iv: recoveryIv,
                    salt: recoverySalt
                }
            });
            showToast("Encryption password changed successfully.", "success");
            setShowRecoveryKey(true);
        } catch (error) {
            console.error("Error changing encryption password:", error);
            showToast("Failed to change encryption password. Please try again.", "error");
        }
    };
    return <div>
        <form className="encryption-password-form" onSubmit={handleSubmit(onSubmit)}>
            <input
                type="text"
                hidden
                autoComplete="username"
            />
            <input
                type="password"
                placeholder="Enter your current password"
                {...register('oldPassword', { required: true })}
                aria-invalid={errors.oldPassword ? "true" : "false"}
                autoComplete="current-password"
            />
            {errors.oldPassword?.type === "required" ? (
                <span role="alert" className="error-message">Current password is required</span>
            ) : null}
            <input
                type="password"
                placeholder="Enter your new password"
                {...register('password1', { required: true, minLength: 8 })}
                aria-invalid={errors.password1 ? "true" : "false"}
                autoComplete="new-password"
            />
            {errors.password1?.type === "required" ? (
                <span role="alert" className="error-message">Password is required</span>
            ) : null}
            {errors.password1?.type === "minLength" ? (
                <span role="alert" className="error-message">Password must be at least 8 characters</span>
            ) : null}
            <input
                type="password"
                placeholder="Confirm your new password"
                {...register('password2',
                    { required: true, validate: (value) => value === password })}
                aria-invalid={errors.password2 ? "true" : "false"}
                autoComplete="new-password"
            />
            {errors.password2?.type === "required" ? (
                <span role="alert" className="error-message">Password is required</span>
            ) : null}
            {errors?.password2 && errors.password2.type === "validate" ? (
                <span role="alert" className="error-message">Passwords do not match</span>
            ) : null}
            <button className="settings-btn settings-btn--primary" type="submit">
                Change Password and Get New Recovery Key
            </button>
        </form>
        <Dialog open={showRecoveryKey} onClose={() => setShowRecoveryKey(false)} className="recovery-key-container">
            <DialogBackdrop className="recovery-key-backdrop" />

            <DialogPanel className="recovery-key-content">
                <DialogTitle>Recovery Key</DialogTitle>
                <Description>
                    Please save this recovery key in a secure location.
                    You will need it to recover your data if you forget your password.
                </Description>
                <ul className="encryption-list">
                    <li>Write it down on a piece of paper and keep it in a secure location.</li>
                    <li>Use a password manager that supports secure note storage to save your recovery key.</li>
                    <li>Save it to a secure cloud storage service that you use, such as Google Drive, Dropbox, or iCloud Drive.</li>
                    <li>Share it with a person you trust to store it securely.</li>
                </ul>
                <div className="recovery-key-wrapper">
                    <CopyButton className="recovery-key-copy-button" text={recoveryKey ?? ''} />
                    <div className="recovery-key-text">
                        <pre>{recoveryKey}</pre>
                    </div>
                </div>
                <input
                    type="checkbox"
                    id="recovery-key-confirm"
                    required
                    checked={confirmedRecoveryKey}
                    onChange={(e) => setConfirmedRecoveryKey(e.target.checked)}
                />
                <label htmlFor="recovery-key-confirm">
                    I have saved my recovery key in a secure location.
                </label>
                {!confirmedRecoveryKey && <p className="recovery-key-confirm-warning">You must confirm that you have saved your recovery key before closing.</p>}
                <p className="recovery-key-warning">
                    <strong>Important:</strong> If you lose both your password and recovery code,
                    there is <strong>no way to recover your data</strong>.
                </p>
                <div className="recovery-key-actions">
                    <button
                        disabled={!confirmedRecoveryKey}
                        className="settings-btn settings-btn--primary"
                        onClick={() => setShowRecoveryKey(false)}
                    >
                        Close
                    </button>
                </div>
            </DialogPanel>
        </Dialog>
    </div>
}


export default ChangeEncryptionPasswordForm;
