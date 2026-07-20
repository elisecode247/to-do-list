import { X } from 'lucide-react';
import './close-button.css';

type CloseButtonProps = {
    onClick: () => void;
    label: string;
};
const CloseButton = ({ onClick, label }: CloseButtonProps) => {
    return (
        <button
            type="button"
            className="drawer-close-button"
            onClick={onClick}
            aria-label={label}
        >
            <X size={24} className="drawer-close-icon" strokeWidth={2} />
        </button>
    );
};

export default CloseButton;
