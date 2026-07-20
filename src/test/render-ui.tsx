import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export type RenderedUi = {
    container: HTMLDivElement;
    root: Root;
    unmount: () => Promise<void>;
};

export async function renderUi(node: ReactNode): Promise<RenderedUi> {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
        root.render(node);
    });

    return {
        container,
        root,
        unmount: async () => {
            await act(async () => {
                root.unmount();
            });
            container.remove();
        },
    };
}

export async function click(element: HTMLElement): Promise<void> {
    await act(async () => {
        element.click();
    });
}

export async function flushEffects(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}
