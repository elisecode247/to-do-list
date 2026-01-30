export type ToastMessage = {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
};

export interface ToastContextType {
    toasts: ToastMessage[];
    showToast: (message: string, type?: 'success' | 'error') => void;
    removeToast: (id: number) => void;
}
