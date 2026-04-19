import { useState } from 'react';
import { useTheme } from 'src/themes/use-theme';
import type { ThemeMode, ThemeStyle, Density } from 'src/themes/types';
import { readPersistentSetting } from 'src/utilities/persistent-storage';

function getStored<T extends string>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    return (readPersistentSetting(key) as T) ?? fallback;
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
