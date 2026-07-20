import type { MODES, STYLES, DENSITIES, GRAPHICS } from './constants';

export type ThemeMode = typeof MODES[number];
export type ThemeStyle = typeof STYLES[number];
export type Density = typeof DENSITIES[number];
export type ThemeGraphic = typeof GRAPHICS[number];

export interface ThemeState {
    mode: ThemeMode;
    style: ThemeStyle;
    graphics: ThemeGraphic;
    toggleIconText: 'true' | 'false';
}

export interface ThemeState {
    mode: ThemeMode;
    style: ThemeStyle;
    density: Density;
    graphics: ThemeGraphic;
    customColors?: Record<string, string>;
}

