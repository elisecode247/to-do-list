import { createRoot } from 'react-dom/client'
import 'src/index.css'
import App from 'app/App.tsx';
import { ToastProvider } from 'src/toast/toast-context';
import { AuthenticationProvider } from 'src/authentication/authentication-context';
import { TaskProvider } from 'src/app/task-context.tsx';

createRoot(document.getElementById('app-root')!).render(
    <AuthenticationProvider>
        <ToastProvider>
            <TaskProvider>
                <App />
            </TaskProvider>
        </ToastProvider>
    </AuthenticationProvider>
)
