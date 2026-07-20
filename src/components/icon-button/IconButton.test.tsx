// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import IconButton from './IconButton';
import { useTheme } from 'src/themes/use-theme';
import { click, renderUi } from 'src/test/render-ui';

function ThemeToggle() {
    const { toggleIconText, updateTheme } = useTheme();

    return (
        <button
            type="button"
            aria-label="Toggle icon text"
            onClick={() => updateTheme({
                toggleIconText: toggleIconText === 'true' ? 'false' : 'true',
            })}
        >
            Toggle
        </button>
    );
}

describe('IconButton', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('theme-toggle-icon-text', 'false');
        window.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });
    });

    it('updates its label when the icon-text preference changes in the same tab', async () => {
        const rendered = await renderUi(
            <>
                <ThemeToggle />
                <IconButton
                    className="test-icon-button"
                    icon={<svg aria-hidden="true" />}
                    label="Edit"
                    onClick={vi.fn()}
                    showLabel
                />
            </>,
        );

        const iconButton = rendered.container.querySelector<HTMLButtonElement>('.test-icon-button');
        const themeToggle = rendered.container.querySelector<HTMLButtonElement>('[aria-label="Toggle icon text"]');

        expect(iconButton?.textContent).not.toContain('Edit');

        await click(themeToggle!);

        expect(iconButton?.textContent).toContain('Edit');

        await rendered.unmount();
    });
});
