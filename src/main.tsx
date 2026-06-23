import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactNode } from 'react';
import 'src/index.css';
import App from 'app/App';
import { ToastProvider } from 'src/toast/toast-provider';
import { AuthenticationProvider } from 'src/authentication/authentication-provider';
import GoogleCalendarProviderGate from 'src/google-authorization/GoogleCalendarProviderGate';
import { UserSettingsProvider } from 'src/user-settings/user-settings-provider';
import { TaskProvider } from 'src/app/task-provider';
import { DemoProvider } from 'src/pages/demo/demo-provider';
import { DemoTaskProvider } from 'src/pages/demo/demo-task-provider';
import { AppRouter } from 'src/router';

type ProviderComponent = ComponentType<{ children: ReactNode }>;

const combineComponents = (components: ProviderComponent[]): ProviderComponent => {
  return components.reduce(
    (AccumulatedComponents, CurrentComponent) => {
      return ({ children }: { children: ReactNode }) => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
    },
    ({ children }: { children: ReactNode }) => <>{children}</>,
  );
};

const providers = [
    AppRouter,
    AuthenticationProvider,
    ToastProvider,
    UserSettingsProvider,
    GoogleCalendarProviderGate,
    DemoProvider,
    DemoTaskProvider,
    TaskProvider,
];

const AppContextProvider = combineComponents(providers);

createRoot(document.getElementById('app-root')!).render(
    <AppContextProvider>
        <App />
    </AppContextProvider>
);
