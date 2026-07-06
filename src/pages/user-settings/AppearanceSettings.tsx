import { useState } from 'react';
import { useTheme } from 'src/themes/use-theme';
import type { ThemeMode, ThemeStyle, Density } from 'src/themes/types';
import { readPersistentSetting } from 'src/utilities/persistent-storage';
import { cssVariableToHex } from 'src/themes/utilities/convertToHex';
import styles from "src/themes/ThemePlayground.module.css";
import "./appearance-settings.css";

function getStored<T extends string>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    return (readPersistentSetting(key) as T) ?? fallback;
}

const colors = [
    ["Background", "--color-background", styles.swatchBackground],
    ["Primary", "--color-primary", styles.swatchPrimary],
    ["Accent", "--color-accent", styles.swatchAccent],
];

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

    const [graphics, setGraphics] = useState<'true' | 'false'>(() =>
        getStored('theme-graphics', 'true')
    );

    const [customColors, setCustomColors] = useState(() => {
        const stored = readPersistentSetting('theme-custom-colors');
        return stored ? JSON.parse(stored) : {};
    });

    const { updateTheme } = useTheme();

    function handleSetMode(newMode: ThemeMode) {
        setMode(newMode);
        updateTheme({ mode: newMode });
    }

    function handleSetStyle(newStyle: ThemeStyle) {
        setStyle(newStyle);
        updateTheme({ style: newStyle });
    }

    function handleSetCustomColor(variable: string, color: string) {
        const newCustomColors = { ...customColors, [variable]: color };
        setCustomColors(newCustomColors);
        updateTheme({ customColors: newCustomColors });
    }

    function handleSetDensity(newDensity: Density) {
        setDensity(newDensity);
        updateTheme({ density: newDensity });
    }

    function handleSetGraphics(newGraphics: 'true' | 'false') {
        setGraphics(newGraphics);
        updateTheme({ graphics: newGraphics });
    }

    return (
        <section className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>
            <div className="swatches">
                {colors.map(([label, variable, swatchClass]) => {
                    const colorValue = cssVariableToHex(variable);
                    return (
                        <div key={variable} className={`swatch ${swatchClass}`}>
                            <strong>{label}</strong>
                            {style === 'custom' ? (
                                <>
                                <input
                                    className="color-input"
                                    type="color"
                                    value={customColors[variable] || colorValue}
                                    onChange={(e) => handleSetCustomColor(variable, e.target.value)}
                                />
                                <strong>{customColors[variable] || colorValue}</strong>
                                </>
                            ) : (
                                <p className="tp-color-value">{colorValue}</p>
                            )}
                        </div>
                    );
                })}
            </div>

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
                        { value: 'winter', label: 'Winter' },
                        { value: 'custom', label: 'Custom' },
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

            {/* GRAPHICS */}
            {style !== 'calm' && style !== 'custom' ? (
                <fieldset>
                    <legend>Background Animation</legend>
                    <RadioGroup
                        name="theme-graphics"
                        value={graphics}
                        onChange={handleSetGraphics}
                        options={[
                            { value: 'true', label: 'Enabled' },
                            { value: 'false', label: 'Disabled' },
                        ]}
                    />
                </fieldset>
            ) : null}
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
