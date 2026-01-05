import { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import './toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

const Toast = function({ message, type, onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast toast--${type}`}>
            <div className="toast__icon">
                {type === 'error' && <AlertCircle size={20} />}
                {type === 'success' && <CheckCircle size={20} />}
            </div>
            <p className="toast__message">{message}</p>
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
