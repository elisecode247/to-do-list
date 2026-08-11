// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderUi, type RenderedUi } from 'src/test/render-ui';
import { TAB_TODAY, TAB_UPCOMING, VIEW_JOURNAL, VIEW_LIST } from './tabs/types';
import ViewBreadcrumb from './ViewBreadcrumb';

let rendered: RenderedUi | undefined;

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
});

describe('ViewBreadcrumb', () => {
    it('changes views and list tabs from their dropdowns', async () => {
        const onTabChange = vi.fn();
        const onViewChange = vi.fn();
        rendered = await renderUi(
            <ViewBreadcrumb
                activeView={VIEW_LIST}
                activeTab={TAB_TODAY}
                onTabChange={onTabChange}
                onViewChange={onViewChange}
                placement="mobile"
            />,
        );

        const viewButton = rendered.container.querySelector(
            'button[aria-label="Change view"]',
        ) as HTMLButtonElement;
        const tabButton = rendered.container.querySelector(
            'button[aria-label="Change list tab"]',
        ) as HTMLButtonElement;

        expect(viewButton.textContent).toContain('List');
        expect(tabButton.textContent).toContain('Today');

        await act(async () => {
            viewButton.click();
        });

        const journalItem = Array.from(document.body.querySelectorAll<HTMLButtonElement>(
            '.view-breadcrumb__menu-item',
        )).find(item => item.textContent === 'Journal');

        expect(journalItem).toBeDefined();

        await act(async () => {
            journalItem?.click();
        });

        expect(onViewChange).toHaveBeenCalledWith(VIEW_JOURNAL);

        await act(async () => {
            tabButton.click();
        });

        const upcomingItem = Array.from(document.body.querySelectorAll<HTMLButtonElement>(
            '.view-breadcrumb__menu-item',
        )).find(item => item.textContent === 'Upcoming');

        expect(upcomingItem).toBeDefined();

        await act(async () => {
            upcomingItem?.click();
        });

        expect(onTabChange).toHaveBeenCalledWith(TAB_UPCOMING);
    });
});
