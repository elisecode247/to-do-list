import { useLayoutEffect, useState, useCallback, useMemo } from 'react';
import type { ThemeMode, ThemeStyle, Density, ThemeState } from './types';

export function useTheme(
    overrideMode?: ThemeMode,
    overrideStyle?: ThemeStyle,
    overrideDensity?: Density
) {
    const hasOverride =
        overrideMode !== undefined &&
        overrideStyle !== undefined &&
        overrideDensity !== undefined;

    const getStoredTheme = (): ThemeState => ({
        mode: (localStorage.getItem('theme-mode') as ThemeMode) || 'system',
        style: (localStorage.getItem('theme-style') as ThemeStyle) || 'calm',
        density: (localStorage.getItem('theme-density') as Density) || 'comfortable',
    });

    const storedTheme = useMemo(getStoredTheme, []);

    const [theme, setTheme] = useState<ThemeState>(
        hasOverride
            ? { mode: overrideMode!, style: overrideStyle!, density: overrideDensity! }
            : storedTheme
    );

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

    // Apply theme whenever stored theme or override changes
    useLayoutEffect(() => {
        if (hasOverride) {
            applyTheme({ mode: overrideMode!, style: overrideStyle!, density: overrideDensity! });
        } else {
            applyTheme(theme);
        }
    }, [theme, hasOverride, overrideMode, overrideStyle, overrideDensity, applyTheme]);

    // Persist only when NOT overridden
    useLayoutEffect(() => {
        if (hasOverride) return;
        localStorage.setItem('theme-mode', theme.mode);
        localStorage.setItem('theme-style', theme.style);
        localStorage.setItem('theme-density', theme.density);
    }, [theme, hasOverride]);

    // System mode listener only when NOT overridden
    useLayoutEffect(() => {
        if (hasOverride) return;
        if (theme.mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => applyTheme(theme);
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, [theme, hasOverride, applyTheme]);

    // Storage listener only when NOT overridden
    useLayoutEffect(() => {
        if (hasOverride) return;

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
    }, [hasOverride]);

    const updateTheme = useCallback((updates: Partial<ThemeState>) => {
        if (hasOverride) return;
        setTheme(prev => ({ ...prev, ...updates }));
    }, [hasOverride]);

    return { ...theme, updateTheme };
}
