import { useLayoutEffect, useEffect, useState, useEffectEvent } from 'react';
import type { ThemeMode, ThemeStyle, Density, ThemeState, ThemeGraphic } from './types';
import {
    removePersistentSetting,
    readPersistentSetting,
    requestPersistentStorage,
    writePersistentSetting,
} from 'src/utilities/persistent-storage';

const THEME_CUSTOM_COLORS_KEY = 'theme-custom-colors';

const readStoredCustomColors = (): Record<string, string> => {
    const stored = readPersistentSetting(THEME_CUSTOM_COLORS_KEY);

    if (!stored) {
        return {};
    }

    try {
        const parsed = JSON.parse(stored) as unknown;

        if (parsed && typeof parsed === 'object') {
            return Object.fromEntries(
                Object.entries(parsed).filter((entry): entry is [string, string] =>
                    typeof entry[0] === 'string' && typeof entry[1] === 'string',
                ),
            );
        }
    } catch {
        // Ignore malformed stored values and fall back to an empty custom palette.
    }

    return {};
};

const getStoredTheme = (): ThemeState => ({
    mode: (readPersistentSetting('theme-mode') as ThemeMode) || 'system',
    style: (readPersistentSetting('theme-style') as ThemeStyle) || 'calm',
    density: (readPersistentSetting('theme-density') as Density) || 'comfortable',
    graphics: (readPersistentSetting('theme-graphics') as ThemeGraphic) ?? 'true',
    customColors: readStoredCustomColors(),
});

export function useTheme(
    overrideMode?: ThemeMode,
    overrideStyle?: ThemeStyle,
    overrideDensity?: Density,
    overrideGraphics?: ThemeGraphic,
) {
    const hasOverride =
        overrideMode !== undefined &&
        overrideStyle !== undefined &&
        overrideDensity !== undefined &&
        overrideGraphics !== undefined;

    const [theme, setTheme] = useState<ThemeState>(
        hasOverride
            ? { mode: overrideMode!, style: overrideStyle!, density: overrideDensity!, graphics: 'true' }
            : getStoredTheme(),
    );

    const applyTheme = useEffectEvent(({ mode, style, density, graphics, customColors }: ThemeState) => {
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

        if (style === 'custom' && customColors) {
            for (const variable in customColors) {
                document.documentElement.style.setProperty(variable, customColors[variable]);
            }
        } else if (style !== 'custom') {
            const storedCustomColors = readStoredCustomColors();

            for (const variable of Object.keys(storedCustomColors)) {
                document.documentElement.style.removeProperty(variable);
            }
        }

        // Density
        root.setAttribute('data-density', density);

        // Graphics
        root.setAttribute('data-graphics', graphics);
    });

    // Apply theme whenever stored theme or override changes
    useLayoutEffect(() => {
        const nextTheme = hasOverride
            ? { mode: overrideMode!, style: overrideStyle!, density: overrideDensity!, graphics: 'true' as ThemeGraphic }
            : theme;

        applyTheme(nextTheme);
    }, [theme, hasOverride, overrideMode, overrideStyle, overrideDensity, overrideGraphics]);


    useEffect(() => {
        requestPersistentStorage();
    }, []);

    useEffect(() => {
        if (hasOverride) return;

        // Persist
        writePersistentSetting('theme-mode', theme.mode);
        writePersistentSetting('theme-style', theme.style);
        writePersistentSetting('theme-density', theme.density);
        writePersistentSetting('theme-graphics', theme.graphics);

        if (theme.customColors) {
            writePersistentSetting(THEME_CUSTOM_COLORS_KEY, JSON.stringify(theme.customColors));
        } else {
            removePersistentSetting(THEME_CUSTOM_COLORS_KEY);
        }

        // System mode listener
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme.mode === 'system') {
                applyTheme(theme);
            }
        };

        // Storage listener
        const handleStorage = (e: StorageEvent) => {
            if (
                e.key === 'theme-mode' ||
                e.key === 'theme-style' ||
                e.key === 'theme-density' ||
                e.key === 'theme-graphics' ||
                e.key === THEME_CUSTOM_COLORS_KEY
            ) {
                setTheme(getStoredTheme());
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        window.addEventListener('storage', handleStorage);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, [theme, hasOverride]);


    const updateTheme = (updates: Partial<ThemeState>) => {
        if (hasOverride) return;
        setTheme(prev => ({ ...prev, ...updates }));
    };

    return { ...theme, updateTheme };
}
