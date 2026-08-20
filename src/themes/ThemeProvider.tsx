import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    removePersistentSetting,
    readPersistentSetting,
    requestPersistentStorage,
    writePersistentSetting,
} from 'src/utilities/persistent-storage';
import { ThemeContext } from './theme-context';
import type { Density, ThemeGraphic, ThemeMode, ThemeState, ThemeStyle } from './types';

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
    toggleIconText: (readPersistentSetting('theme-toggle-icon-text') as 'true' | 'false') ?? 'true',
    toggleSortCompleted: (readPersistentSetting('theme-toggle-sort-completed') as 'true' | 'false') ?? 'false',
});

const applyTheme = ({ mode, style, density, graphics, customColors }: ThemeState) => {
    const root = document.documentElement;

    if (mode === 'system') {
        root.removeAttribute('data-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.style.colorScheme = prefersDark ? 'dark' : 'light';
    } else {
        root.setAttribute('data-theme', mode);
        root.style.colorScheme = mode;
    }

    if (style === 'calm') {
        root.removeAttribute('data-theme-style');
    } else {
        root.setAttribute('data-theme-style', style);
    }

    if (style === 'custom' && customColors) {
        for (const variable in customColors) {
            root.style.setProperty(variable, customColors[variable]);
        }
    } else if (style !== 'custom') {
        const storedCustomColors = readStoredCustomColors();

        for (const variable of Object.keys(storedCustomColors)) {
            root.style.removeProperty(variable);
        }
    }

    root.setAttribute('data-density', density);
    root.setAttribute('data-graphics', graphics);
};

interface ThemeOverride {
    id: string;
    theme: ThemeState;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeState>(getStoredTheme);
    const [overrides, setOverrides] = useState<ThemeOverride[]>([]);
    const effectiveTheme = overrides.at(-1)?.theme ?? theme;

    const updateTheme = useCallback((updates: Partial<ThemeState>) => {
        setTheme(currentTheme => ({ ...currentTheme, ...updates }));
    }, []);

    const registerOverride = useCallback((id: string, overrideTheme: ThemeState) => {
        setOverrides(currentOverrides => [
            ...currentOverrides.filter(current => current.id !== id),
            { id, theme: overrideTheme },
        ]);

        return () => {
            setOverrides(currentOverrides => currentOverrides.filter(current => current.id !== id));
        };
    }, []);

    useLayoutEffect(() => {
        applyTheme(effectiveTheme);
    }, [effectiveTheme]);

    useEffect(() => {
        void requestPersistentStorage();
    }, []);

    useEffect(() => {
        writePersistentSetting('theme-mode', theme.mode);
        writePersistentSetting('theme-style', theme.style);
        writePersistentSetting('theme-density', theme.density);
        writePersistentSetting('theme-graphics', theme.graphics);
        writePersistentSetting('theme-toggle-icon-text', theme.toggleIconText);
        writePersistentSetting('theme-toggle-sort-completed', theme.toggleSortCompleted);

        if (theme.customColors) {
            writePersistentSetting(THEME_CUSTOM_COLORS_KEY, JSON.stringify(theme.customColors));
        } else {
            removePersistentSetting(THEME_CUSTOM_COLORS_KEY);
        }
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (effectiveTheme.mode === 'system') {
                applyTheme(effectiveTheme);
            }
        };
        const handleStorage = (event: StorageEvent) => {
            if (
                event.key === 'theme-mode' ||
                event.key === 'theme-style' ||
                event.key === 'theme-density' ||
                event.key === 'theme-graphics' ||
                event.key === 'theme-toggle-icon-text' ||
                event.key === 'theme-toggle-sort-completed' ||
                event.key === THEME_CUSTOM_COLORS_KEY
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
    }, [effectiveTheme]);

    const value = useMemo(() => ({
        theme: effectiveTheme,
        updateTheme,
        registerOverride,
    }), [effectiveTheme, registerOverride, updateTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
