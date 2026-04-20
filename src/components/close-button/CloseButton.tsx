import { XCircle } from 'lucide-react';
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
            <XCircle size={28} className="drawer-close-icon" strokeWidth={1} />
        </button>
    );
};

export default CloseButton;
