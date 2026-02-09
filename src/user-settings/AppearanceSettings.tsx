import { useEffect, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';
type ThemeStyle = 'space' | 'nature' | 'ocean';
type Density = 'comfortable' | 'compact';

function AppearanceSettings() {
    const [mode, setMode] = useState<ThemeMode>('system');
    const [style, setStyle] = useState<ThemeStyle>('space');
    const [density, setDensity] = useState<Density>('comfortable');

    // Apply to <html>
    useEffect(() => {
        const root = document.documentElement;

        // Theme mode
        if (mode === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', mode);
        }

        root.setAttribute('data-theme-style', style);
        root.setAttribute('data-density', density);
    }, [mode, style, density]);

    return (
        <section className="settings-section">
            <h3>Appearance</h3>

            {/* MODE */}
            <fieldset>
                <legend>Mode</legend>
                <RadioGroup
                    value={mode}
                    onChange={setMode}
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
                    value={style}
                    onChange={setStyle}
                    options={[
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
                    value={density}
                    onChange={setDensity}
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
    value,
    onChange,
    options,
}: {
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
                        name={options[0].value}
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
