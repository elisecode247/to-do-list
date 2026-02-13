import { useLayoutEffect, useState, useCallback } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';
type ThemeStyle = 'calm' | 'space' | 'nature' | 'ocean';
type Density = 'comfortable' | 'compact';

interface ThemeState {
    mode: ThemeMode;
    style: ThemeStyle;
    density: Density;
}

export function useTheme() {
    const getStoredTheme = (): ThemeState => ({
        mode: (localStorage.getItem('theme-mode') as ThemeMode) || 'system',
        style: (localStorage.getItem('theme-style') as ThemeStyle) || 'calm',
        density: (localStorage.getItem('theme-density') as Density) || 'comfortable',
    });

    const [theme, setTheme] = useState<ThemeState>(getStoredTheme);

    const applyTheme = useCallback(({ mode, style, density }: ThemeState) => {
        const root = document.documentElement;

        // Mode
        if (mode === 'system') {
            root.removeAttribute('data-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.style.colorScheme = prefersDark ? 'dark' : 'light';
        } else {
            root.setAttribute('data-theme', mode);
            root.style.colorScheme = mode;
        }

        // Style
        if (style === 'calm') {
            root.removeAttribute('data-theme-style');
        } else {
            root.setAttribute('data-theme-style', style);
        }

        // Density
        root.setAttribute('data-density', density);
    }, []);

    // Apply theme whenever it changes
    useLayoutEffect(() => {
        applyTheme(theme);
        localStorage.setItem('theme-mode', theme.mode);
        localStorage.setItem('theme-style', theme.style);
        localStorage.setItem('theme-density', theme.density);
    }, [theme, applyTheme]);

    useLayoutEffect(() => {
        if (theme.mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
            applyTheme(theme); // re-apply theme on system change
        };
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, [theme, applyTheme]);

    // Listen for changes from other tabs/windows
    useLayoutEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (
                e.key === 'theme-mode' ||
                e.key === 'theme-style' ||
                e.key === 'theme-density'
            ) {
                setTheme(getStoredTheme());
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Helper to update theme programmatically
    const updateTheme = useCallback((updates: Partial<ThemeState>) => {
        setTheme(prev => ({ ...prev, ...updates }));
    }, []);

    return { ...theme, updateTheme };
}
