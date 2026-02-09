import { useLayoutEffect } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';
type ThemeStyle = 'space' | 'nature' | 'ocean';
type Density = 'comfortable' | 'compact';

export function useTheme() {
    useLayoutEffect(() => {
        const root = document.documentElement;

        const mode =
            (localStorage.getItem('theme-mode') as ThemeMode) ?? 'system';
        const style =
            (localStorage.getItem('theme-style') as ThemeStyle) ?? 'space';
        const density =
            (localStorage.getItem('theme-density') as Density) ?? 'comfortable';

        // Mode
        if (mode === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', mode);
        }

        // Style + density
        root.setAttribute('data-theme-style', style);
        root.setAttribute('data-density', density);
    }, []);
}
