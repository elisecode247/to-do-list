import type { EncryptionConfig } from "src/encryption/types";

export class InvalidPasswordError extends Error {
    constructor() {
        super("Incorrect password");
        this.name = "InvalidPasswordError";
    }
}

export function toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

export function generateRecoveryKey(bytes = 24): string {
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

export function generateMasterKey(): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(32)).buffer;
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
export function base64ToUint8Array(base64: string) {
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
    let masterKeyBytes: ArrayBuffer | null = null;
    try {
        masterKeyBytes = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: encryptionConfig.passwordProtector.iv as BufferSource,
            },
            passwordCryptoKey,
            encryptionConfig.passwordProtector.wrappedKey
        );

    } catch (err) {
        console.error(err);
        // AES-GCM tag verification failure -> wrong password (or corrupted data),
        // not a real "operation" bug. Re-throw as a typed error.
        if (err instanceof DOMException && err.name === "OperationError") {
            throw new InvalidPasswordError();
        } else {
            throw err;
        }
    }
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
    // don't throw an error if decrypt fails so it doesn't block other journal entries from loading
    try {
        const decryptedContent = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: base64ToUint8Array(iv),
            },
            masterKey,
            base64ToUint8Array(ciphertext)
        );

        return new TextDecoder().decode(decryptedContent);
    } catch (err) {
        console.error(err);
        return '[Unable to decrypt entry]';
    }
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
