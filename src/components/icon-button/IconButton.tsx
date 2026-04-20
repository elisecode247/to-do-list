import React from 'react';
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
}: IconButtonProps) => {
    return (
        <button
            type="button"
            className={`icon-button ${isPriority ? "icon-button--priority" : ""} ${className} `}
            onClick={onClick}
            aria-label={ariaLabel ?? label}
        >
            {icon}
            {showLabel && <span>{label}</span>}
            {children}
        </button>
    );
};

export default IconButton;
