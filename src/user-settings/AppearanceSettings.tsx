import { useEffect, useState } from 'react';
import { useTheme } from './use-theme';

type ThemeMode = 'system' | 'light' | 'dark';
type ThemeStyle = 'calm' | 'space' | 'nature' | 'ocean';
type Density = 'comfortable' | 'compact';

function getStored<T extends string>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    return (localStorage.getItem(key) as T) ?? fallback;
}

function AppearanceSettings() {
    const [mode, setMode] = useState<ThemeMode>(() =>
        getStored('theme-mode', 'system')
    );

    const [style, setStyle] = useState<ThemeStyle>(() =>
        getStored('theme-style', 'calm')
    );

    const [density, setDensity] = useState<Density>(() =>
        getStored('theme-density', 'comfortable')
    );

    const { updateTheme } = useTheme();

    function handleSetMode(newMode: ThemeMode) {
        setMode(newMode);
        updateTheme({ mode: newMode });
    }

    function handleSetStyle(newStyle: ThemeStyle) {
        setStyle(newStyle);
        updateTheme({ style: newStyle });
    }

    function handleSetDensity(newDensity: Density) {
        setDensity(newDensity);
        updateTheme({ density: newDensity });
    }

    useEffect(() => {
        localStorage.setItem('theme-mode', mode);
        localStorage.setItem('theme-style', style);
        localStorage.setItem('theme-density', density);
    }, [mode, style, density]);

    return (
        <section className="settings-section">
            <h3>Appearance</h3>

            {/* MODE */}
            <fieldset>
                <legend>Mode</legend>
                <RadioGroup
                    name="theme-mode"
                    value={mode}
                    onChange={handleSetMode}
                    options={[
                        { value: 'system', label: 'System' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                    ]}
                />
            </fieldset>

            {/* THEME */}
            <fieldset>
                <legend>Theme</legend>
                <RadioGroup
                    name="theme-style"
                    value={style}
                    onChange={handleSetStyle}
                    options={[
                        { value: 'calm', label: 'Calm' },
                        { value: 'space', label: 'Space' },
                        { value: 'nature', label: 'Nature' },
                        { value: 'ocean', label: 'Ocean' },
                    ]}
                />
            </fieldset>

            {/* DENSITY */}
            <fieldset>
                <legend>Layout Density</legend>
                <RadioGroup
                    name="theme-density"
                    value={density}
                    onChange={handleSetDensity}
                    options={[
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'compact', label: 'Compact' },
                    ]}
                />
            </fieldset>
        </section>
    );
}

function RadioGroup<T extends string>({
    name,
    value,
    onChange,
    options,
}: {
    name: string;
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
}) {
    return (
        <div className="radio-group" role="radiogroup">
            {options.map(opt => (
                <label key={opt.value} className="radio-option">
                    <input
                        type="radio"
                        name={name}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                    />
                    <span>{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

export default AppearanceSettings;
