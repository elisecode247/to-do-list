import { useCallback, useMemo, useState, useEffect, useEffectEvent } from "react";
import { API_URL } from "src/app/constants";
import { authHeaders } from 'src/authentication/authentication-api';
import { useEncryptionKey } from "src/encryption/encryption-key-context";
import type { JournalEntry } from "src/journal/types";

const ENCRYPTION_URL = `${API_URL}/encryption`;

interface EncryptedEntry extends JournalEntry {
    id: string;
    ciphertext: string;
    iv: string;
    encryptionVersion: number;
}

interface FailedEncryptedEntry extends JournalEntry {
    error: 'failed_encryption'
    skipped: boolean;
}
interface FailedCommitEntry extends EncryptedEntry {
    error: "failed_commit";
    skipped: boolean;
}
export interface EncryptionMigrationJob {
    jobId: string;
    total: number;
    batchSize: number;
    processed: number;
}

type ProcessingStep =
    | "not_started"
    | "processing_batch"
    | "committing"
    | "retry_encrypt"
    | "retry_commit"
    | "completed";


export function useEncryptionMigration() {
    const { encryptData, updateEncryptionStatus, isUnlocked } = useEncryptionKey();
    const [job, setJob] = useState<EncryptionMigrationJob | null>(null);
    const [failedEntries, setFailedEntries] = useState<(FailedEncryptedEntry | FailedCommitEntry)[]>([]);
    const [encryptedBuffer, setEncryptedBuffer] = useState<EncryptedEntry[]>([]);
    const [processingStep, setProcessingStep] = useState<ProcessingStep>("not_started");
    const [busy, setBusy] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [skippedEntries, setSkippedEntries] = useState<(FailedEncryptedEntry | FailedCommitEntry)[]>([]);

    const jobId = job?.jobId || null;

    const progress = useMemo(() => {
        if (!job || job.total === 0) {
            return { processed: 0, total: 0, percent: 0 };
        }

        return {
            processed: job.processed,
            total: job.total,
            percent: Math.round((job.processed / job.total) * 100),
        };
    }, [job]);

    const refresh = useCallback(async (refreshJobId?: string) => {
        setBusy(true);
        if (!refreshJobId && !jobId) {
            setBusy(false);
            return;
        }
        try {
            const res = await fetch(`${ENCRYPTION_URL}/jobs/${refreshJobId ?? jobId}`, {
                headers: await authHeaders(),
            });

            if (res.status === 404) {
                setJob(null);
                return;
            }

            const data = await res.json();
            setJob(data.job);
            updateEncryptionStatus(data.encryptionStatus ?? 'migrating');
            return job;
        } catch (error) {
            console.error("Failed to refresh encryption migration job:", error);
            throw error;
        } finally {
            setBusy(false);
        }
        return job;
    }, [jobId, updateEncryptionStatus, job]);

    const start = useCallback(async () => {
        setBusy(true);
        try {
            const res = await fetch(`${ENCRYPTION_URL}/jobs/start`, {
                method: "POST",
                headers: await authHeaders()
            });

            if (!res.ok) {
                throw new Error("Failed to start encryption migration");
            }

            const data = await res.json();
            if (!data.job && data.encryptionStatus === 'encrypted') {
                setJob(null);
                updateEncryptionStatus(data.encryptionStatus);
                setProcessingStep('completed');
                return;
            }
            updateEncryptionStatus(data.encryptionStatus ?? 'migrating');
            setProcessingStep('processing_batch');
            refresh(data.job?.jobId);
        } catch (error) {
            console.error("Failed to start encryption migration:", error);
            setProcessingStep("not_started");
            throw error;
        } finally {
            setBusy(false);
        }
    }, [updateEncryptionStatus, refresh]);

    const encryptBatch = useCallback(async (entries: JournalEntry[] | FailedEncryptedEntry[]) => {
        const encrypted: EncryptedEntry[] = [];
        const failed: FailedEncryptedEntry[] = [];

        for (const entry of entries) {
            try {
                const encryptedData = await encryptData(entry.text);

                encrypted.push({
                    ...entry,
                    id: entry.id,
                    ciphertext: encryptedData.ciphertext,
                    iv: encryptedData.iv,
                    encryptionVersion: encryptedData.encryptionVersion
                });
            } catch (error) {
                console.error(`Failed to encrypt entry ${entry.id}:`, error);
                failed.push({
                    ...entry,
                    id: entry.id,
                    error: 'failed_encryption',
                    day: entry.day,
                    text: entry.text,
                    skipped: false
                });
            }
        }

        return { encrypted, failed };
    }, [encryptData]);

    const fetchBatch = useCallback(async () => {
        const res = await fetch(
            `${API_URL}/journal/batch?limit=${job?.batchSize}&include=unencrypted`,
            {
                method: "GET",
                headers: await authHeaders()
            }
        );

        if (!res.ok) throw new Error("Failed to fetch batch");

        return res.json() as Promise<JournalEntry[]>;
    }, [job]);

    const commitMigration = useCallback(async (encryptedEntries?: EncryptedEntry[]) => {
        if (!job) return;
        setBusy(true);
        const encryptedBufferToCommit = encryptedEntries ? encryptedEntries?.map(entry => ({
            ...entry,
            text: ''
        })) : encryptedBuffer.map(entry => ({
            ...entry,
            text: ''
        }));
        if (!encryptedBufferToCommit || encryptedBufferToCommit.length === 0) {
            setBusy(false);
            throw new Error("No encrypted entries to commit");
            return;
        }
        try {
            const res = await fetch(
                `${API_URL}/journal/batch-commit`,
                {
                    method: "POST",
                    headers: await authHeaders(),
                    body: JSON.stringify({
                        jobId: job.jobId,
                        encryptedBuffer: encryptedBufferToCommit
                    })
                }
            );

            if (!res.ok) throw new Error("Failed to commit migration");

            const result = await res.json();
            if (result.failedEntries.length > 0) {
                setProcessingStep('retry_commit');
                setFailedEntries(result.failedEntries.map((entry: FailedCommitEntry) => ({
                    ...entry,
                    error: 'failed_commit',
                    skipped: false
                })));
            } else {
                setProcessingStep('processing_batch');
            }
            refresh(job.jobId);
            return result;
        } catch (error) {
            console.error("Failed to commit migration:", error);
            throw error;
        } finally {
            setBusy(false);
        }
    }, [job, encryptedBuffer, refresh]);

    const continueEncryption = useCallback(async () => {
        if (!isUnlocked) {
            setDialogOpen(true);
            return;
        }
        if (!job) return;
        setBusy(true);

        try {
            const journalEntries = await fetchBatch();
            const { encrypted, failed } = await encryptBatch(journalEntries);

            setFailedEntries(failed);
            setEncryptedBuffer(encrypted);
            if (failed.length > 0) {
                setProcessingStep('retry_encrypt');
            } else {
                setProcessingStep('committing');
            }
        } catch (error) {
            console.error("Failed to continue migration:", error);
            setProcessingStep('processing_batch');
            throw error;
        } finally {
            setBusy(false);
        }
    }, [job, encryptBatch, fetchBatch, isUnlocked, setDialogOpen]);

    const retryFailed = useCallback(async () => {
        if (!job) return;
        setBusy(true);
        try {
            if (processingStep === 'retry_encrypt') {
                const { encrypted, failed } = await encryptBatch(failedEntries.filter(entry => !entry.skipped && entry.error === 'failed_encryption') as FailedEncryptedEntry[]);
                setFailedEntries(failed);
                setEncryptedBuffer(prev => [...prev, ...encrypted]);
            }
            if (processingStep === 'retry_commit') {
                const res = await fetch(
                    `${API_URL}/journal/batch-commit`,
                    {
                        method: "POST",
                        headers: await authHeaders(),
                        body: JSON.stringify({
                            jobId: job.jobId,
                            encryptedBuffer: failedEntries.filter(entry => !entry.skipped && entry.error === 'failed_commit') as EncryptedEntry[]
                        }),
                    }
                );
                if (!res.ok) throw new Error("Failed to commit migration");
                const updatedJob = await res.json();
                const updatedFailedEntries = updatedJob.failedEntries.map((entry: JournalEntry) => ({
                    ...entry,
                    error: 'failed_commit',
                    skipped: false
                }));
                if (updatedFailedEntries.length === 0) {
                    setProcessingStep('processing_batch');
                } else {
                    setFailedEntries(updatedFailedEntries);
                }
                refresh(updatedJob.jobId);
            }
        } catch (error) {
            console.error("Failed to retry failed entries:", error);
            throw error;
        } finally {
            setBusy(false);
        }
    }, [job, failedEntries, processingStep, encryptBatch, refresh]);

    const skipFailed = useCallback(async () => {
        if (!job) return;
        setBusy(true);
        try {
            // filter out already skipped entries and mark the rest as skipped
            const updatedFailedEntries = failedEntries.filter(entry => {
                if (skippedEntries.some(skipped => skipped.id === entry.id)) {
                    return false; // already skipped, remove from failedEntries
                }
                return true; // keep in failedEntries
            }).map(entry => ({ ...entry, skipped: true })); // mark as skipped
            setFailedEntries(updatedFailedEntries);
            setSkippedEntries([...skippedEntries, ...updatedFailedEntries]);
            await fetch(`${ENCRYPTION_URL}/jobs/${job.jobId}/update-processed-count`, {
                method: "POST",
                headers: await authHeaders(),
                body: JSON.stringify({ processedCount: updatedFailedEntries.length })
            });
            refresh(job.jobId);
            if (processingStep === 'retry_encrypt') {
                setProcessingStep('committing');
            } else if (processingStep === 'retry_commit') {
                setProcessingStep('processing_batch');
            }
        } catch (error) {
            console.error("Failed to skip failed entries:", error);
            throw error;
        } finally {
            setBusy(false);
        }
    }, [job, failedEntries, processingStep, skippedEntries, refresh]);

    // process batch encrypts and commits if no errors encountered
    const processBatch = useCallback(async () => {
        if (!job) return;
        if (!isUnlocked) {
            setDialogOpen(true);
            return;
        }
        setBusy(true);
        const batch = await fetchBatch();

        const encrypted = await encryptBatch(batch);
        setEncryptedBuffer(encrypted.encrypted);
        if (encrypted.failed.length) {
            setFailedEntries(encrypted.failed);
            setProcessingStep("retry_encrypt");
            setBusy(false);
            return;
        }
        if (encrypted.encrypted.length === 0) {
            setBusy(false);
            refresh(job.jobId);
            return;
        }
        const commit = await commitMigration(encrypted.encrypted);

        if (commit.failedEntries.length) {
            setFailedEntries(commit.failedEntries.map((entry: FailedCommitEntry) => ({
                ...entry,
                error: 'failed_commit',
                skipped: false
            })));
            setProcessingStep("retry_commit");
            setBusy(false);
            return;
        }

        const latestJob = await refresh(job.jobId);
        if (!latestJob) {
            setBusy(false);
            throw new Error("Failed to refresh job after processing batch");
            return;
        }
        if (latestJob && latestJob.processed < latestJob.total) {
            processBatch();
        } else {
            setProcessingStep("completed");
            fetch(`${ENCRYPTION_URL}/jobs/${latestJob.jobId}/complete`, {
                method: "POST",
                headers: await authHeaders()
            });
            updateEncryptionStatus('encrypted');
        }
        refresh(latestJob.jobId);
        setBusy(false);
    }, [job, commitMigration, refresh, isUnlocked, setDialogOpen, encryptBatch, fetchBatch, updateEncryptionStatus]);

    const pageRefresh = useEffectEvent(refresh);
    useEffect(function onPageLoad() {
        pageRefresh();
    }, []);

    useEffect(() => {
        if (isUnlocked) {
            setDialogOpen(false);
        }
    }, [isUnlocked]);

    return {
        busy,
        failedEntries,
        progress,
        processingStep,
        start,
        commitMigration,
        continueEncryption,
        retryFailed,
        skipFailed,
        refresh,
        dialogOpen,
        setDialogOpen,
        processBatch
    };
}
