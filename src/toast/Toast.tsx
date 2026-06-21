import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Undo2, X } from 'lucide-react';
import './toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
    undoAction?: () => void;
}

const Toast = function({ message, type, onClose, duration = 4000, undoAction }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleUndo = () => {
        if (undoAction) {
            undoAction();
        }
        onClose();
    }

    return (
        <div className={`toast toast--${type}`}>
            <div className="toast__icon">
                {type === 'error' && <AlertCircle size={20} />}
                {type === 'success' && <CheckCircle size={20} />}
                {type === 'info' && <AlertCircle size={20} />}
            </div>
            <p className="toast__message">{message}</p>
            {undoAction && (
                <button
                    className="toast__undo"
                    onClick={handleUndo}
                    aria-label="Undo action"
                >
                    Undo
                    <Undo2 size={16} />
                </button>
            )}
            <button
                className="toast__close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export default Toast;
