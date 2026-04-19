import { createRoot } from 'react-dom/client'
import 'src/index.css'
import App from 'app/App';
import { ToastProvider } from 'src/toast/toast-provider';
import { AuthenticationProvider } from 'src/authentication/authentication-provider';
import { GoogleCalendarProvider } from 'src/google-authorization/google-calendar-provider';
import { TaskProvider } from 'src/app/task-provider';
import { DemoProvider } from 'src/pages/demo/demo-provider';
import { DemoTaskProvider } from 'src/pages/demo/demo-task-provider';
import { AppRouter } from 'src/router';

createRoot(document.getElementById('app-root')!).render(
    <AppRouter>
        <AuthenticationProvider>
            <GoogleCalendarProvider>
                <ToastProvider>
                    <DemoProvider>
                        <DemoTaskProvider>
                            <TaskProvider>
                                <App />
                            </TaskProvider>
                        </DemoTaskProvider>
                    </DemoProvider>
                </ToastProvider>
            </GoogleCalendarProvider>
        </AuthenticationProvider >
    </AppRouter>
)
