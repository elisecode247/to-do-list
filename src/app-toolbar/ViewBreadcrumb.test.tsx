// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderUi, type RenderedUi } from 'src/test/render-ui';
import { TAB_TODAY, TAB_UPCOMING, VIEW_LIST } from './tabs/types';
import ViewBreadcrumb from './ViewBreadcrumb';

let rendered: RenderedUi | undefined;

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
});

describe('ViewBreadcrumb', () => {
    it('keeps the view static and changes tabs from the dropdown', async () => {
        const onTabChange = vi.fn();
        rendered = await renderUi(
            <ViewBreadcrumb
                activeView={VIEW_LIST}
                activeTab={TAB_TODAY}
                appliedFilterCount={1}
                onTabChange={onTabChange}
                placement="mobile"
            />,
        );

        const select = rendered.container.querySelector(
            'select[aria-label="Change list tab"]',
        ) as HTMLSelectElement;

        expect(select).not.toBeNull();
        expect(select.value).toBe(TAB_TODAY);
        expect(rendered.container.querySelector('.view-breadcrumb__part--context')?.textContent)
            .toBe('List');

        await act(async () => {
            select.value = TAB_UPCOMING;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        expect(onTabChange).toHaveBeenCalledWith(TAB_UPCOMING);
    });
});
