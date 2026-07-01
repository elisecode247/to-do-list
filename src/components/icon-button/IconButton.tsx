import React, { useRef, useState, useCallback } from 'react';
import './icon-button.css';

type IconButtonProps = {
    className: string;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
    showLabel?: boolean;
    isPriority?: boolean;
    ariaLabel?: string;
    children?: React.ReactNode;
    longPressLabel?: string; // tooltip text shown on long press, defaults to `label`
    longPressDuration?: number; // ms, defaults to 500
};

const IconButton = ({
    className,
    onClick,
    label,
    icon,
    showLabel = false,
    isPriority = false,
    ariaLabel,
    children,
    longPressLabel,
    longPressDuration = 500,
}: IconButtonProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasLongPress = useRef(false);

    const clearPressTimer = useCallback(() => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    }, []);

    const handlePointerDown = useCallback(() => {
        wasLongPress.current = false;
        pressTimer.current = setTimeout(() => {
            wasLongPress.current = true;
            setShowTooltip(true);
        }, longPressDuration);
    }, [longPressDuration]);

    const handlePointerUp = useCallback(() => {
        clearPressTimer();
        setShowTooltip(false);
    }, [clearPressTimer]);

    const handlePointerLeave = useCallback(() => {
        clearPressTimer();
        setShowTooltip(false);
    }, [clearPressTimer]);

    const handleClick = useCallback(() => {
        // Suppress the click that fires after a long press
        if (wasLongPress.current) {
            wasLongPress.current = false;
            return;
        }
        onClick();
    }, [onClick]);

    return (
        <button
            type="button"
            className={`icon-button ${isPriority ? "icon-button--priority" : ""} ${className}}`}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            aria-label={ariaLabel ?? label}
        >
            {icon}
            {showLabel && <span>{label}</span>}
            {showTooltip && (
                <span className="icon-button__tooltip" role="tooltip">
                    {longPressLabel ?? label}
                </span>
            )}
            {children}
        </button>
    );
};

export default IconButton;
