import { forwardRef, useRef, useState, useCallback, type ReactNode } from 'react';
import { useTheme } from 'src/themes/use-theme';
import './icon-button.css';

type IconButtonProps = {
    className: string;
    onClick?: () => void;
    label: string;
    title?: string;
    icon: ReactNode;
    showLabel?: boolean;
    isPriority?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    'aria-label'?: string;
    children?: ReactNode;
    longPressLabel?: string; // tooltip text shown on long press, defaults to `label`
    longPressDuration?: number; // ms, defaults to 500
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
    className,
    onClick,
    label,
    title,
    icon,
    showLabel = true,
    isPriority = false,
    ariaLabel,
    'aria-label': ariaLabelProp,
    children,
    longPressLabel,
    longPressDuration = 500,
    disabled = false,
}, ref) => {
    const { toggleIconText } = useTheme();
    const [showTooltip, setShowTooltip] = useState(false);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const accessibleLabel = ariaLabel ?? ariaLabelProp ?? label;
    const wasLongPress = useRef(false);
    const shouldShowLabel = showLabel && toggleIconText === 'true';

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
        onClick?.();
    }, [onClick]);

    return (
        <button
            type="button"
            title={title ?? ariaLabel ?? label}
            className={`icon-button ${isPriority ? "icon-button--priority" : ""} ${className}`}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            aria-label={accessibleLabel}
            disabled={disabled}
            ref={ref}
        >
            {icon}
            {shouldShowLabel && <span>{label}</span>}
            {!shouldShowLabel && showTooltip && (
                <span className="icon-button__tooltip" role="tooltip">
                    {longPressLabel ?? label}
                </span>
            )}
            {children}
        </button>
    );
});

IconButton.displayName = 'IconButton';

export default IconButton;
