import { useContext } from 'react';
import { ThemeContext } from './theme-context';

function useThemeContext() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}

export function useTheme() {
    const context = useThemeContext();

    return {
        ...context.theme,
        updateTheme: context.updateTheme,
    };
}

