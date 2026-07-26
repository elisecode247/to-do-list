import { useContext, useId, useLayoutEffect, useMemo } from 'react';
import { CALM_STYLE, COMFORTABLE_DENSITY, DARK_MODE, GRAPHICS_FALSE } from './constants';
import { ThemeContext } from './theme-context';
import type { Density, ThemeGraphic, ThemeMode, ThemeState, ThemeStyle } from './types';

const LOADING_THEME: ThemeState = {
    mode: DARK_MODE,
    style: CALM_STYLE,
    density: COMFORTABLE_DENSITY,
    graphics: GRAPHICS_FALSE,
    toggleIconText: 'true',
};

const ignoreThemeUpdate = () => undefined;

function useThemeContext() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}

export function useThemeOverride(
    overrideMode?: ThemeMode,
    overrideStyle?: ThemeStyle,
    overrideDensity?: Density,
    overrideGraphics?: ThemeGraphic,
    isLoading?: boolean,
) {
    const context = useThemeContext();
    const registerOverride = context.registerOverride;
    const overrideId = useId();
    const hasOverride =
        overrideMode !== undefined &&
        overrideStyle !== undefined &&
        overrideDensity !== undefined &&
        overrideGraphics !== undefined;
    const overrideTheme = useMemo<ThemeState | null>(() => {
        if (isLoading) {
            return LOADING_THEME;
        }

        if (hasOverride) {
            return {
                mode: overrideMode!,
                style: overrideStyle!,
                density: overrideDensity!,
                graphics: overrideGraphics!,
                toggleIconText: 'true',
            };
        }

        return null;
    }, [hasOverride, isLoading, overrideDensity, overrideGraphics, overrideMode, overrideStyle]);

    useLayoutEffect(() => {
        if (!overrideTheme) {
            return;
        }

        return registerOverride(overrideId, overrideTheme);
    }, [registerOverride, overrideId, overrideTheme]);

    return {
        ...(overrideTheme ?? context.theme),
        updateTheme: overrideTheme ? ignoreThemeUpdate : context.updateTheme,
    };
}
