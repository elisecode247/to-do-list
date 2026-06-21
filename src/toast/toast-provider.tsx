import { useState, type ReactNode } from 'react';
import Toast from 'src/toast/Toast';
import type { ToastMessage } from 'src/toast/types';
import { ToastContext } from 'src/toast/toast-context';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: ToastMessage['type'] = 'success', undoAction?: () => void) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, undoAction }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {/* Render toasts globally */}
            <div className="toast-container">
            {toasts.map(t => (
                <Toast
                    key={t.id}
                    message={t.message}
                    type={t.type}
                    onClose={() => removeToast(t.id)}
                    undoAction={t.undoAction}
                />
            ))}
            </div>
            {children}
        </ToastContext.Provider>
    );
};
