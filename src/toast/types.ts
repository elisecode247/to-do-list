export type ToastMessage = {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    undoAction?: () => void;
};

export interface ToastContextType {
    toasts: ToastMessage[];
    showToast: (message: string, type?: 'success' | 'error' | 'info', undoAction?: () => void) => void;
    removeToast: (id: string) => void;
}
