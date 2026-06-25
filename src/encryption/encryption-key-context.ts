// src/encryption/encryption-key-context.tsx
import { createContext, useContext, useState, useCallback, type ReactNode, createElement } from 'react';
import { unlockMasterKey } from './utilities';
import type { EncryptionConfig } from './types';

type EncryptionKeyContextValue = {
    masterKey: CryptoKey | null;
    isUnlocked: boolean;
    unlock: (password: string, config: EncryptionConfig) => Promise<void>;
    lock: () => void;
};

const EncryptionKeyContext = createContext<EncryptionKeyContextValue | null>(null);

export const EncryptionKeyProvider = ({ children }: { children: ReactNode }) => {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

    const unlock = useCallback(async (password: string, config: EncryptionConfig) => {
        const key = await unlockMasterKey(password, config);
        setMasterKey(key);
    }, []);

    const lock = useCallback(() => setMasterKey(null), []);

    const value={ masterKey, isUnlocked: !!masterKey, unlock, lock }

    return createElement(EncryptionKeyContext.Provider, { value }, children);
};

export const useEncryptionKey = () => {
    const ctx = useContext(EncryptionKeyContext);
    if (!ctx) throw new Error('useEncryptionKey must be used within EncryptionKeyProvider');
    return ctx;
};
