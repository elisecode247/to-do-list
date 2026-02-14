import type { MODES, STYLES, DENSITIES } from './constants';

export type ThemeMode = typeof MODES[number];
export type ThemeStyle = typeof STYLES[number];
export type Density = typeof DENSITIES[number];

export interface ThemeState {
  mode: ThemeMode;
  style: ThemeStyle;
  density: Density;
}
