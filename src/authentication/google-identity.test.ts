import { beforeEach, describe, expect, test, vi } from "vitest";

const googleApi = {
    accounts: {
        id: {
            initialize: vi.fn(),
            prompt: vi.fn(),
            disableAutoSelect: vi.fn(),
            renderButton: vi.fn(),
        },
        oauth2: {
            initCodeClient: vi.fn(),
        },
    },
} as unknown as typeof window.google;

describe("Google Identity Services loader", () => {
    beforeEach(() => {
        vi.resetModules();
        document.head
            .querySelectorAll('script[src="https://accounts.google.com/gsi/client"]')
            .forEach((script) => script.remove());
        delete (window as Partial<Window>).google;
    });

    test("loads the SDK when it was not already initialized", async () => {
        const { loadGoogleIdentity } = await import("./google-identity");
        const loading = loadGoogleIdentity();
        const script = document.head.querySelector<HTMLScriptElement>(
            'script[src="https://accounts.google.com/gsi/client"]',
        );

        expect(script).not.toBeNull();

        window.google = googleApi;
        script?.dispatchEvent(new Event("load"));

        await expect(loading).resolves.toBe(googleApi);
    });

    test("reuses an SDK that is already initialized", async () => {
        window.google = googleApi;
        const { loadGoogleIdentity } = await import("./google-identity");

        await expect(loadGoogleIdentity()).resolves.toBe(googleApi);
        expect(document.head.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]',
        )).toBeNull();
    });
});
