import { useEffect, useEffectEvent, useRef } from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import './toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
    undoAction?: () => void;
}

type ToastCopy = {
    title: string;
    subtitle?: string;
};

const toSentenceCase = (value: string) => {
    if (!value) {
        return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

const getToastCopy = (message: string, type: ToastProps['type'], hasUndoAction: boolean): ToastCopy => {
    if (!hasUndoAction) {
        return { title: message };
    }

    const quotedMessageMatch = message.match(/^"(.+)"\s+(.+)$/);
    if (quotedMessageMatch) {
        return {
            title: quotedMessageMatch[1],
            subtitle: toSentenceCase(quotedMessageMatch[2])
        };
    }

    if (type === 'success') {
        return {
            title: message,
            subtitle: 'Action completed'
        };
    }

    return { title: message };
};

const Toast = function({ message, type, onClose, duration = 300000, undoAction }: ToastProps) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const handleClose = useEffectEvent(onClose);
    const toastCopy = getToastCopy(message, type, Boolean(undoAction));

    useEffect(() => {
        timerRef.current = setTimeout(handleClose, duration);
        return () => clearTimeout(timerRef.current as NodeJS.Timeout);
    }, [duration]);

    const handleUndo = () => {
        if (undoAction) {
            undoAction();
        }
        handleClose();
    }

    return (
        <div className={`toast toast--${type}`}>
            <div className="toast__icon" aria-hidden="true">
                {type === 'error' && <AlertCircle size={22} strokeWidth={2.3} />}
                {type === 'success' && <Check size={24} strokeWidth={2.6} />}
                {type === 'info' && <Info size={22} strokeWidth={2.3} />}
            </div>
            <div className="toast__content">
                <p className="toast__message">{toastCopy.title}</p>
                {toastCopy.subtitle && (
                    <p className="toast__subtitle">{toastCopy.subtitle}</p>
                )}
            </div>
            {undoAction && (
                <button
                    className="toast__undo"
                    onClick={handleUndo}
                    aria-label="Undo action"
                >
                    Undo
                </button>
            )}
            <button
                className="toast__close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X size={28} strokeWidth={1.4} />
            </button>
        </div>
    );
}

export default Toast;
