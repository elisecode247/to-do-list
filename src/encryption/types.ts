export interface ServerEncryptionConfig {
    version: number;
    passwordProtector: {
        wrappedKey: string; // base64-encoded
        iv: string; // base64-encoded
        salt: string; // base64-encoded
    };
    recoveryProtector: {
        wrappedKey: string; // base64-encoded
        iv: string; // base64-encoded
        salt: string; // base64-encoded
    };
}

export interface EncryptionConfig {
        version: number;
        passwordProtector: {
            wrappedKey: ArrayBuffer;
            iv: Uint8Array;
            salt: Uint8Array;
        };
        recoveryProtector: {
            wrappedKey: ArrayBuffer;
            iv: Uint8Array;
            salt: Uint8Array;
        };
    }
