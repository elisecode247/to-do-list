import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('authentication API session responses', () => {
    beforeEach(() => {
        vi.resetModules();
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    test('restores the token and email from one refresh request', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            accessToken: 'refreshed-access-token',
            expiresIn: 3600,
            email: 'person@example.com',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const auth = await import('./authentication-api');
        const token = await auth.getValidAuthToken();

        expect(token).toBe('refreshed-access-token');
        expect(auth.getAuthEmail()).toBe('person@example.com');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('uses the login response email without loading a separate session', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            accessToken: 'new-access-token',
            expiresIn: 3600,
            email: 'person@example.com',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const auth = await import('./authentication-api');
        const user = await auth.loginWithGoogle('google-token');

        expect(user).toEqual({ email: 'person@example.com' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
