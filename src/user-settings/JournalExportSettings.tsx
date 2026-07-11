import { useState } from 'react';
import IconButton from 'src/components/icon-button/IconButton';
import { Download } from 'lucide-react';
import { API_URL } from 'src/app/constants';
import { authHeaders } from 'src/authentication/authentication-api';
import { useToast } from 'src/toast/use-toast';
import './journal-export-settings.css';

export default function JournalExportSettings() {
    const [isExporting, setIsExporting] = useState(false);
    const { showToast } = useToast();

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

            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            const fileNameMatch = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
            const fileName = fileNameMatch?.[1] ?? `journal-export-${new Date().toISOString().slice(0, 10)}.json`;

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
