import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    ApiRequestError,
    isChoreAccessChangedError,
    subscribeToChoreAccessChanges,
    updateTaskCompletion,
} from './api';

vi.mock('src/authentication/authentication-api', () => ({
    authHeaders: vi.fn().mockResolvedValue({
        'Content-Type': 'application/json',
    }),
}));

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('chore access-change responses', () => {
    it('notifies subscribers and preserves the 404 status', async () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToChoreAccessChanges(listener);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
            new Response('Not found', { status: 404 }),
        ));

        let thrown: unknown;
        try {
            await updateTaskCompletion('chore-id', null);
        } catch (error) {
            thrown = error;
        } finally {
            unsubscribe();
        }

        expect(listener).toHaveBeenCalledTimes(1);
        expect(thrown).toBeInstanceOf(ApiRequestError);
        expect(isChoreAccessChangedError(thrown)).toBe(true);
        expect((thrown as ApiRequestError).status).toBe(404);
    });

    it('does not report other request failures as access changes', async () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToChoreAccessChanges(listener);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
            new Response('Conflict', { status: 409 }),
        ));

        let thrown: unknown;
        try {
            await updateTaskCompletion('chore-id', null);
        } catch (error) {
            thrown = error;
        } finally {
            unsubscribe();
        }

        expect(listener).not.toHaveBeenCalled();
        expect(isChoreAccessChangedError(thrown)).toBe(false);
    });
});
