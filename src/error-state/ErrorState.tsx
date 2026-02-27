import { AlertCircle, RefreshCw } from 'lucide-react';
import './error-state.css';

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="error-state">
            <AlertCircle size={48} className="error-state__icon" />
            <h2 className="error-state__title">Something went wrong</h2>
            <p className="error-state__message">{message}</p>
            {onRetry && (
                <button
                    className="error-state__button"
                    onClick={() => onRetry()}
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorState;
