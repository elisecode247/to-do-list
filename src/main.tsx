import { createRoot } from 'react-dom/client'
import 'src/index.css'
import App from 'app/App.tsx';
import { ToastProvider } from 'src/toast/toast-context';
import { AuthenticationProvider } from 'src/authentication/authentication-context';
import { TaskProvider } from 'src/app/task-context.tsx';
import { DemoProvider } from 'src/demo/DemoContext.tsx';
import { DemoTaskProvider } from './demo/demo-task-context';

createRoot(document.getElementById('app-root')!).render(

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

)
