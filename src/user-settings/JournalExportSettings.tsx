import { useState } from 'react';
import IconButton from 'src/components/icon-button/IconButton';
import { Download } from 'lucide-react';
import { API_URL } from 'src/app/constants';
import { authHeaders } from 'src/authentication/authentication-api';
import { useToast } from 'src/toast/use-toast';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';
import './journal-export-settings.css';

type ExportEntry = {
    id?: string;
    text?: string;
    ciphertext?: string;
    iv?: string;
    [key: string]: unknown;
};

export default function JournalExportSettings() {
    const [isExporting, setIsExporting] = useState(false);
    const { showToast } = useToast();
    const { isEncryptionEnabled, isUnlocked, decryptData } = useEncryptionKey();

    async function handleExport() {
        if (isExporting) {
            return;
        }

        setIsExporting(true);

        try {
            const response = await fetch(`${API_URL}/journal/export`, {
                method: 'GET',
                headers: await authHeaders(),
            });

            if (!response.ok) {
                const text = await response.text();
                let parsed: { error?: string } | null = null;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    // Non-JSON error body; fall back to raw response text below.
                }
                if (parsed?.error) {
                    throw new Error(parsed.error);
                } else {
                    throw new Error(text);
                }
            }

            const text = await response.text();
            const contentDisposition = response.headers.get('content-disposition');
            const fileNameMatch = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
            const fileName = fileNameMatch?.[1] ?? `journal-export-${new Date().toISOString().slice(0, 10)}.json`;

            let outputText = text;

            try {
                const parsed = JSON.parse(text);
                const entries: ExportEntry[] = Array.isArray(parsed)
                    ? parsed
                    : Array.isArray((parsed as { entries?: ExportEntry[] }).entries)
                        ? (parsed as { entries: ExportEntry[] }).entries
                        : [];

                if (entries.length > 0 && isEncryptionEnabled) {
                    if (!isUnlocked) {
                        throw new Error('Unlock your journal before exporting decrypted entries.');
                    }

                    const decryptedEntries = await Promise.all(entries.map(async (entry) => {
                        if (!entry.ciphertext || !entry.iv) {
                            return entry;
                        }

                        const decryptedText = await decryptData(entry.ciphertext, entry.iv);
                        return {
                            ...entry,
                            text: decryptedText,
                        };
                    }));

                    outputText = JSON.stringify(
                        Array.isArray(parsed)
                            ? decryptedEntries
                            : { ...(parsed as Record<string, unknown>), entries: decryptedEntries },
                        null,
                        2
                    );
                }
            } catch (parseOrDecryptError) {
                if (parseOrDecryptError instanceof Error && parseOrDecryptError.message.includes('Unlock your journal')) {
                    throw parseOrDecryptError;
                }
                // If response is not JSON, export as-is.
            }

            const blob = new Blob([outputText], { type: 'application/json;charset=utf-8' });

            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = decodeURIComponent(fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);

            showToast('Journal exported successfully.', 'success');
        } catch (error) {
            console.error('Failed to export journal:', error);
            showToast((error as Error).message, 'error');
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <div className="settings-section">
            <h3 className="settings-section-title">
                Export Your Journal
            </h3>
            <IconButton
                disabled={isExporting}
                className="settings-btn"
                icon={<Download size={20} />}
                label={isExporting ? 'Exporting...' : 'Export Journal'}
                onClick={handleExport}
            />
        </div>
    );
}
