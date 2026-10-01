import "./theme-playground.css";
import styles from "./ThemePlayground.module.css";
import { useState, useLayoutEffect } from "react";
import { useTheme } from "src/themes/use-theme";
import type { ThemeStyle } from "src/themes/types";
import { readPersistentSetting } from "src/utilities/persistent-storage";
import { cssVariableToHex } from "src/themes/utilities/convertToHex";

function ColorVariableInput({
    variable,
    mode,
    style,
}: {
    variable: string;
    mode: string;
    style: string;
}) {
    const [colorValue, setColorValue] = useState("#000000");

    useLayoutEffect(() => {
        requestAnimationFrame(() => {
            setColorValue(cssVariableToHex(variable));
        });
    }, [variable, mode, style]);

    return (
        <>
            <input
                className="tp-color-input"
                type="color"
                value={colorValue}
                readOnly
            />
            <strong>{colorValue}</strong>
        </>
    );
}
function getStored<T extends string>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    return (readPersistentSetting(key) as T) ?? fallback;
}
export default function ThemePlayground() {
    const { updateTheme } = useTheme();

    const [mode, setMode] = useState<"system" | "light" | "dark">(() =>
        getStored("theme-mode", "system")
    );

    const [style, setStyle] = useState<ThemeStyle>(() =>
        getStored("theme-style", "calm")
    );
    const [graphics, setGraphics] = useState<"true" | "false">(() =>
        getStored("theme-graphics", "true")
    );

    function handleSetStyle(newStyle: ThemeStyle) {
        setStyle(newStyle);
        updateTheme({ style: newStyle });
    }
    function handleSetMode(newMode: "system" | "light" | "dark") {
        setMode(newMode);
        updateTheme({ mode: newMode });
    }

    function handleSetGraphics(newGraphics: "true" | "false") {
        setGraphics(newGraphics);
        updateTheme({ graphics: newGraphics });
    }
    const themes: ThemeStyle[] = [
        "calm",
        "space",
        "nature",
        "ocean",
        "winter",
    ];
    const colors = [
        ["Background", "--color-background", styles["swatch-background"]],
        ["Surface", "--color-surface", styles["swatch-surface"]],
        ["Surface Transparent", "--color-surface-transparent", styles["swatch-surface-transparent"]],
        ["Primary", "--color-primary", styles["swatch-primary"]],
        ["Primary Hover", "--color-primary-hover", styles["swatch-primary-hover"]],
        ["Secondary", "--color-secondary", styles["swatch-secondary"]],
        ["Accent", "--color-accent", styles["swatch-accent"]],
        ["Accent Background", "--color-accent-bg", styles["swatch-accent-background"]],
        ["Success", "--color-success", styles["swatch-success"]],
        ["Info", "--color-info", styles["swatch-info"]],
        ["Warning", "--color-warning", styles["swatch-warning"]],
        ["Danger", "--color-danger", styles["swatch-danger"]],
        ["Border", "--color-border", styles["swatch-border"]],
        ["Hover", "--color-hover", styles["swatch-hover"]],
    ];

    return (
        <div className="theme-playground">

            <h1>Theme Playground</h1>
            <section className="tp-section">
                <h2>Theme</h2>
                <div className="tp-row">
                    <button
                        className={`tp-btn ${mode === "system"
                            ? "tp-btn-primary"
                            : "tp-btn-secondary"
                            }`}
                        onClick={() => handleSetMode("system")}
                    >
                        System
                    </button>
                    <button
                        className={`tp-btn ${mode === "light"
                            ? "tp-btn-primary"
                            : "tp-btn-secondary"
                            }`}
                        onClick={() => handleSetMode("light")}
                    >
                        Light
                    </button>
                    <button
                        className={`tp-btn ${mode === "dark"
                            ? "tp-btn-primary"
                            : "tp-btn-secondary"
                            }`}
                        onClick={() => handleSetMode("dark")}
                    >
                        Dark
                    </button>
                </div>

                <div className="tp-row">
                    {themes.map(theme => (
                        <button
                            key={theme}
                            className={`tp-btn ${style === theme
                                ? "tp-btn-primary"
                                : "tp-btn-secondary"
                                }`}
                            onClick={() => handleSetStyle(theme)}
                        >
                            {theme}
                        </button>
                    ))}
                </div>

                <div className="tp-row">
                    <button
                        className={`tp-btn ${graphics === "true"
                            ? "tp-btn-primary"
                            : "tp-btn-secondary"
                            }`}
                        onClick={() => handleSetGraphics("true")}
                    >
                        Enable Background Animation
                    </button>
                    <button
                        className={`tp-btn ${graphics === "false"
                            ? "tp-btn-primary"
                            : "tp-btn-secondary"
                            }`}
                        onClick={() => handleSetGraphics("false")}
                    >
                        Disable Background Animation
                    </button>
                </div>
            </section>
            <section className="tp-section">

                <h2>Color Palette</h2>

                <div className="tp-grid">
                    {colors.map(([label, variable, swatchClass]) => {
                        return (
                            <div key={variable} className="tp-card">
                                <div className={`tp-swatch ${swatchClass}`}>
                                    Aa
                                </div>

                                <strong>{label}</strong>
                                <ColorVariableInput
                                    variable={variable}
                                    mode={mode}
                                    style={style}
                                />
                            </div>
                        )
                    })}
                </div>

            </section>

            <section className="tp-section">

                <h2>Buttons</h2>

                <div className="tp-row">

                    <button className="tp-btn tp-btn-primary">
                        Primary
                    </button>

                    <button className="tp-btn tp-btn-secondary">
                        Secondary
                    </button>

                    <button className="tp-btn tp-btn-accent">
                        Accent
                    </button>

                    <button className="tp-btn tp-btn-danger">
                        Danger
                    </button>

                </div>

            </section>

            <section className="tp-section">

                <h2>Status Pills</h2>

                <div className="tp-row">

                    <span className="tp-pill success">Success</span>
                    <span className="tp-pill info">Info</span>
                    <span className="tp-pill warning">Warning</span>
                    <span className="tp-pill danger">Danger</span>

                </div>

            </section>

            <section className="tp-section">

                <h2>Cards</h2>

                <div className="tp-demo-card">

                    <h3>Today's Tasks</h3>

                    <p>
                        This is normal body text sitting on your surface color.
                    </p>

                    <button className="tp-btn tp-btn-primary">
                        Complete
                    </button>

                </div>

            </section>

            <section className="tp-section">

                <h2>Inputs</h2>

                <input
                    placeholder="Text input"
                />

                <br />
                <br />

                <textarea
                    rows={4}
                    placeholder="Textarea"
                />

                <br />
                <br />

                <select className="select-input">
                    <option>Option One</option>
                    <option>Option Two</option>
                </select>

            </section>

            <section className="tp-section">

                <h2>Hover Preview</h2>

                <div className="tp-hover-box">
                    Hover me
                </div>

            </section>

        </div>
    );
}
