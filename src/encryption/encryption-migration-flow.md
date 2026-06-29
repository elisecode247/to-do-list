# Encryption Process Notes
<!--
|--------------------------------------------------------------------------
| Encryption Migration State Machine
|--------------------------------------------------------------------------
|
| Step | Process                                             | Encryption Status | Migration Status
|------|-----------------------------------------------------|-------------------|-----------------
| 1    | User clicks "Start".                                | not_encrypted     | null
|      | POST /encryption/jobs/start                         |                   |
|      | - Return existing unfinished job if one exists.     |                   |
|      | - Otherwise count unencrypted journal entries.      |                   |
|
| 2a   | If count === 0, return success.                     | encrypted         | completed
|
| 2b   | If count > 0, create migration job.                 | migrating         | pending
|
| 3    | User clicks "Start Migration".                      | migrating         | in_process
|      | - Set job status to in_process.                     |                   |
|      | - GET /journal/batch?limit=500                      |                   |
|      | - Server returns plaintext entries.                 |                   |
|      | - Browser encrypts entries.                         |                   |
|
| 4a   | Browser encryption failures.                        | migrating         | in_process
|      | User retries failed entries.                        |                   |
|      | Repeat Step 3 for failed entries only.              |                   |
|
| 4b   | User skips failed encryption entries.               | migrating         | in_process
|      | POST /encryption/jobs/:jobId/commit                 |                   |
|      | - Bulk update encrypted entries.                    |                   |
|      | - Increment processed (successful updates only).    |                   |
|      | - Return any commit failures.                       |                   |
|
| 5a   | Commit failures returned.                           | migrating         | in_process
|      | User retries failed commit entries.                 |                   |
|
| 5b   | User skips failed commit entries.                   | migrating         | in_process
|      | Continue with the next batch.                       |                   |
|
| 6    | If processed >= total:                              | encrypted         | completed
|      | - Mark migration completed.                         |                   |
|      | - Update user_settings.encryption_status.           |                   |
|--------------------------------------------------------------------------
-->


## sample EncryptionMigrationJob:
const sample = {
    jobId: "12345",
    status: "pending",
    total: 100,
    processed: 0,
    entries: [],
    failedEntries: [
        {id: "3aa508ca-e00a-4e03-b600-9fa0771c0a9e",error: "Encryption failed",date: "2024-06-01",content: "Sample journal entry content",skipped: false},
    ],
    lastError: ''
}
## Sample Journal Entries unencrypted
INSERT INTO journal_entries (
    user_id,
    day,
    entry_time,
    text
)
SELECT
    '6fceda59-dd7b-46ec-b7e4-a7678a649394'::uuid,
    CURRENT_DATE - (n || ' days')::interval,
    NOW() - (n || ' days')::interval,
    'Test journal entry #' || n
FROM generate_series(1, 2000) AS n;
