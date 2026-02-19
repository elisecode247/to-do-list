import { createRoot } from 'react-dom/client'
import 'src/index.css'
import App from 'app/App';
import { ToastProvider } from 'src/toast/toast-context';
import { AuthenticationProvider } from 'src/authentication/authentication-context';
import { TaskProvider } from 'src/app/task-context';
import { DemoProvider } from 'src/pages/demo/DemoContext';
import { DemoTaskProvider } from 'src/pages/demo/demo-task-context';
import { AppRouter } from 'src/router';

createRoot(document.getElementById('app-root')!).render(
    <AppRouter>
        <AuthenticationProvider>
            <ToastProvider>
                <DemoProvider>
                    <DemoTaskProvider>
                        <TaskProvider>
                            <App />
                        </TaskProvider>
                    </DemoTaskProvider>
                </DemoProvider>
            </ToastProvider>
        </AuthenticationProvider >
    </AppRouter>
)
