import type { EncryptionConfig } from "src/encryption/types";

function base64ToUint8Array(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}


function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000; // 32KB at a time, avoids call-stack limits
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

export const unlockMasterKey = async (password: string, encryptionConfig: EncryptionConfig): Promise<CryptoKey> => {
    // 1. Derive password key material
    const passwordKeyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const passwordCryptoKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encryptionConfig.passwordProtector.salt as BufferSource,
            iterations: 600000,
            hash: "SHA-256",
        },
        passwordKeyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    // 2. Decrypt master key
    const masterKeyBytes = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: encryptionConfig.passwordProtector.iv as BufferSource,
        },
        passwordCryptoKey,
        encryptionConfig.passwordProtector.wrappedKey
    );

    // 3. Import master key
    const masterKey = await crypto.subtle.importKey(
        "raw",
        masterKeyBytes,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
    return masterKey;
};

export const decryptData = async (ciphertext: string, iv: string, masterKey: CryptoKey): Promise<string> => {
    if (ciphertext === '' || ciphertext === null) {
        return '';
    }
    const decryptedContent = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: base64ToUint8Array(iv),
        },
        masterKey,
        base64ToUint8Array(ciphertext)
    );

    return new TextDecoder().decode(decryptedContent);
};

export const encryptData = async (
    plaintext: string,
    masterKey: CryptoKey
): Promise<{ ciphertext: string; iv: string }> => {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedContent = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        masterKey,
        new TextEncoder().encode(plaintext)
    );

    return {
        ciphertext: arrayBufferToBase64(encryptedContent),
        iv: arrayBufferToBase64(iv),
    };
};
