import { createContext } from 'react';
import type { ThemeState } from './types';

export interface ThemeContextValue {
    theme: ThemeState;
    updateTheme: (updates: Partial<ThemeState>) => void;
    registerOverride: (id: string, theme: ThemeState) => () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
