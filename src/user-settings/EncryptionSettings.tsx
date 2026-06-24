import { useState } from "react";
import "./encryption-settings.css";
import { useWatch, useForm, type SubmitHandler } from 'react-hook-form';
import { Description, DialogBackdrop, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useToast } from "src/toast/use-toast";
import CopyButton from "src/components/copy-button/CopyButton";
import { useUserSettings } from "./use-user-settings";

interface EncryptionFormInputs {
    password1: string
    password2: string
}

function generateRecoveryKey(bytes = 24): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(bytes));

    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Crockford base32

    let result = "";
    let buffer = 0;
    let bitsLeft = 0;

    for (const byte of randomBytes) {
        buffer = (buffer << 8) | byte;
        bitsLeft += 8;

        while (bitsLeft >= 5) {
            result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
            bitsLeft -= 5;
        }
    }

    if (bitsLeft > 0) {
        result += alphabet[(buffer << (5 - bitsLeft)) & 31];
    }

    return result.match(/.{1,5}/g)?.join("-") ?? result;
}

function generateMasterKey(): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(32)).buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt.slice().buffer,
            iterations: 600_000,
            hash: "SHA-256",
        },
        passwordKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"]
    );
}

function EncryptionSettings({ enabled }: { enabled: boolean }) {
    // React compiler interfering with react hook form
    "use no memo";
    const { showToast } = useToast();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showRecoveryKey, setShowRecoveryKey] = useState(false);
    const [confirmedRecoveryKey, setConfirmedRecoveryKey] = useState(false);
    const [encryptedMasterKeyWithPassword, setEncryptedMasterKeyWithPassword] = useState<ArrayBuffer | null>(null);
    const [masterKeySalt, setMasterKeySalt] = useState<Uint8Array | null>(null);
    const [masterKeyIv, setMasterKeyIv] = useState<Uint8Array | null>(null);
    const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
    const [encryptedMasterKeyWithRecovery, setEncryptedMasterKeyWithRecovery] = useState<ArrayBuffer | null>(null);
    const [recoverySalt, setRecoverySalt] = useState<Uint8Array | null>(null);
    const [recoveryIv, setRecoveryIv] = useState<Uint8Array | null>(null);
    const { setupEncryption } = useUserSettings();
    const { register,
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm<EncryptionFormInputs>({
        mode: 'onBlur', reValidateMode: 'onSubmit', criteriaMode: 'all', shouldFocusError: true, shouldUnregister: false,
        defaultValues: {
            password1: "",
            password2: "",
        },
    });
    const password = useWatch({ name: 'password1', control: control });
    const onSubmit: SubmitHandler<EncryptionFormInputs> = async (data, event) => {
        event?.preventDefault();
        reset();

        try {
            // --- core randomness ---
            const masterKey = generateMasterKey();
            const masterKeyIv = crypto.getRandomValues(new Uint8Array(12));
            const masterKeySalt = crypto.getRandomValues(new Uint8Array(16));

            // --- derive password key ---
            const passwordKey = await deriveKey(data.password1, masterKeySalt);

            // --- encrypt master key with password ---
            const encryptedMasterKeyWithPassword = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: masterKeyIv,
                },
                passwordKey,
                masterKey
            );

            // --- recovery setup ---
            const recoveryKey = generateRecoveryKey(24);
            const recoveryIv = crypto.getRandomValues(new Uint8Array(12));
            const recoverySalt = crypto.getRandomValues(new Uint8Array(16));

            const recoveryCryptoKey = await deriveKey(recoveryKey, recoverySalt);

            // --- encrypt master key with recovery ---
            const encryptedMasterKeyWithRecovery = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: recoveryIv,
                },
                recoveryCryptoKey,
                masterKey
            );
            // --- verify encryption ---
            try {
                await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: masterKeyIv },
                    passwordKey,
                    encryptedMasterKeyWithPassword
                );

                await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: recoveryIv },
                    recoveryCryptoKey,
                    encryptedMasterKeyWithRecovery
                );

            } catch (error) {
                throw new Error("Encryption verification failed.", { cause: error });
            }

            // --- UI state ---
            setRecoveryKey(recoveryKey);
            setShowRecoveryKey(true);

            setEncryptedMasterKeyWithPassword(encryptedMasterKeyWithPassword);
            setMasterKeySalt(masterKeySalt);
            setMasterKeyIv(masterKeyIv);

            setEncryptedMasterKeyWithRecovery(encryptedMasterKeyWithRecovery);
            setRecoverySalt(recoverySalt);
            setRecoveryIv(recoveryIv);

        } catch (error) {
            console.error("Error during encryption setup:", error);

            showToast("Encryption setup failed. Try again.");

        }
    };

    const handleEncryptionSetup = async () => {
        if (!confirmedRecoveryKey) {
            alert("Please confirm that you have saved your recovery key in a secure location.");
            return;
        }
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
            setShowRecoveryKey(false);
            showToast("Encryption setup complete. Your journal is now private.");
        } catch (error) {
            console.error("Error during encryption setup:", error);
            showToast("An error occurred during encryption setup. Please try again.");
            return;
        }

    };

    return (
        <div className="settings-section">
            <h3 className="settings-section-title">Enable Private Journal</h3>
            {!enabled ? (
                <>
                    <p>
                        Enable end-to-end encryption to make your journal private.
                        <strong> Even Daily Reset List cannot read it. </strong>
                        If you enable this setting, you will be prompted to create a password
                        and you will receive a recovery key. Only you will be
                        able to see your journal entries.
                    </p>
                    <p>
                        <strong>Important:</strong> If you lose both your password and recovery code,
                        there is <strong>no way to recover your data</strong>.
                        Please make sure to store your recovery key in a safe place.
                        We recommend at least one of the following methods to securely store your recovery key:
                    </p>
                    <ul className="encryption-list">
                        <li>Write it down on a piece of paper and keep it in a secure location.</li>
                        <li>Use a password manager that supports secure note storage to save your recovery key.</li>
                        <li>Save it to a secure cloud storage service that you use, such as Google Drive, Dropbox, or iCloud Drive.</li>
                        <li>Share it with a person you trust to store it securely.</li>
                    </ul>
                    <button
                        className="settings-btn settings-btn--primary"
                        type="button"
                        onClick={() => setShowPasswordForm(true)}
                    >
                        Enable Encryption
                    </button>
                    {showPasswordForm && (
                        <form className="encryption-password-form" onSubmit={handleSubmit(onSubmit)}>
                            <input
                                type="password"
                                placeholder="Enter your password"
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
                                placeholder="Confirm your password"
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
                                Set Password and Enable Encryption
                            </button>
                        </form>
                    )}
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
                            <p className="recovery-key-warning">
                                <strong>Important:</strong> If you lose both your password and recovery code,
                                there is <strong>no way to recover your data</strong>.
                            </p>
                            <button
                                className="settings-btn settings-btn--primary"
                                onClick={handleEncryptionSetup}
                            >
                                Encrypt Journal
                            </button>
                        </DialogPanel>
                    </Dialog>
                </>
            ) : (
                <p>
                    Client-side encryption is currently enabled on your account.
                    This means that your data is encrypted on the client side before
                    it is sent to the server, and only you can access your unencrypted data.
                    If you want to disable client-side encryption, please contact support.
                </p>
            )}
        </div>
    );
}


export default EncryptionSettings;
