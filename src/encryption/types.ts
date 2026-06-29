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

export type EncryptedResult = { iv: string; ciphertext: string; encryptionVersion: number };

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

export const ENCRYPTION_STATUS = {
  NOT_ENCRYPTED: 'not_encrypted',
  MIGRATING: 'migrating',
  ENCRYPTED: 'encrypted'
} as const;

export type EncryptionStatus = typeof ENCRYPTION_STATUS[keyof typeof ENCRYPTION_STATUS];

export type MigrationJobStatus =
    | "pending"
    | "processing"
    | "completed";

export type MigrationState = {
  status: MigrationJobStatus;

  jobId: string | null;

  total: number;
  processed: number;

  failed: { id: string; error: string }[];

  progress: number; // 0–100

  error?: string;
};
