import { createRoot } from 'react-dom/client'
import 'src/index.css'
import App from 'app/App.tsx';
import { ToastProvider } from 'src/toast/toast-context';

createRoot(document.getElementById('app-root')!).render(
    <ToastProvider>
        <App />
    </ToastProvider>
)
