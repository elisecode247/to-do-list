import { useState, type FormEvent } from 'react';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';
import './journal-lock-screen.css';
import { Lock } from 'lucide-react';
import { useAuthentication } from 'src/authentication/use-authentication';

const JournalLockScreen = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { unlock, encryptionConfig } = useEncryptionKey();
    const { email } = useAuthentication();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!encryptionConfig) return;
        try {
            await unlock(password, encryptionConfig);
        } catch {
            setError("Incorrect password");
        } finally {
            setPassword('');
        }
    };

    return (
        <div className="journal-lock-screen">
            <div className="journal-lock-card">
                <div className="journal-lock-icon"><Lock size={48} /></div>
                <h2 className="journal-lock-title">Journal locked</h2>
                <p className="journal-lock-subtitle">Enter your password to view today's entries</p>

                <form className="journal-lock-form" onSubmit={handleSubmit}>
                    <div className="journal-lock-field">
                        <input
                            id="journal-username"
                            type="text"
                            name="username"
                            autoComplete="username"
                            value={email}
                            readOnly
                            hidden
                        />
                        <label htmlFor="journal-password">Password</label>
                        <input
                            name="password"
                            id="password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="journal-lock-submit">Unlock</button>
                    {error && <p className="journal-lock-error" role="alert">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default JournalLockScreen;
