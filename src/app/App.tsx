import { lazy, type FC } from 'react';
import './app.css';
import './settings.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import LoggedOut from 'src/pages/logged-out/LoggedOut';
import LoggedIn from 'src/pages/logged-in/LoggedIn';
import DemoPage from 'src/pages/demo/DemoPage';
import { Redirect, Route, Switch, useLocation } from "wouter";
import { ROUTES } from 'src/router';
import 'app/app.css';
import ThemeCanvas from './ThemeCanvas';
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
        Sentry.feedbackIntegration({
            submitButtonLabel: "Send Feedback",
            formTitle: "Send Feedback",
            autoInject: false,
        }),
    ],
});

const UserSettingsLazy = lazy(async () => {
    return { default: (await import('src/pages/user-settings/UserSettings')).default };
});

const BulkEditLazy = lazy(async () => {
    return { default: (await import('src/pages/bulk-edit/BulkEdit')).default };
});

const NotFoundLazy = lazy(async () => {
    return { default: (await import('src/pages/not-found/NotFound')).default };
});

const PrivacyPolicyLazy = lazy(async () => {
    return { default: (await import('src/pages/PrivacyPolicy')).default };
});
const ThemePlaygroundLazy = lazy(async () => {
    return { default: (await import('src/themes/ThemePlayground')).default };
});
const TemplatesLazy = lazy(async () => {
    return { default: (await import('src/pages/templates/Templates')).default };
});

const LoadingSpinner = () => {
    return (
        <div className="app_loading-container">
            <div aria-busy="true" className="app_loading-spinner"></div>
        </div>
    );
}

const App: FC = () => {
    const { isAuthenticated, isLoading, login } = useAuthentication();
    const [, setLocation] = useLocation();

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
            setLocation(ROUTES.app);
        }
        catch (err) {
            console.error(err);
        }
    };

    return (

        <>
            <ThemeCanvas />
            <Switch>
                <Route path={ROUTES.home}>
                    <LoggedOut
                        hasAuthenticatedSession={isAuthenticated}
                        onSuccessfulLogin={handleLoginSuccess}
                    />
                </Route>
                <Route path={ROUTES.app}>
                    {isLoading ? <LoadingSpinner /> :
                        isAuthenticated ? (
                            <LoggedIn />
                        ) : <Redirect to={ROUTES.home} replace />}
                </Route>
                <Route path={ROUTES.demo}>
                    {/** Demo page is faster without Suspense */}
                    <DemoPage onSuccessfulLogin={handleLoginSuccess} />
                </Route>
                <Route path={ROUTES.userSettings}>
                    {isLoading ? <LoadingSpinner /> :
                        isAuthenticated ? (
                            <UserSettingsLazy />
                        ) : <Redirect to={ROUTES.home} replace />}
                </Route>
                <Route path={ROUTES.bulkEdit}>
                    {isLoading ? <LoadingSpinner /> :
                        isAuthenticated ? (
                            <BulkEditLazy />
                        ) : <Redirect to={ROUTES.home} replace />}
                </Route>
                <Route path="/settings">
                    <Redirect to={ROUTES.userSettings} replace />
                </Route>
                <Route path="/bulk-edit">
                    <Redirect to={ROUTES.bulkEdit} replace />
                </Route>
                <Route path={ROUTES.privacyPolicy}>
                    <PrivacyPolicyLazy />
                </Route>
                <Route path={ROUTES.themePlayground}>
                    <ThemePlaygroundLazy />
                </Route>
                <Route path={ROUTES.templates}>
                    <TemplatesLazy />
                </Route>
                <Route>
                    <NotFoundLazy />
                </Route>
            </Switch>
        </>
    );
};

export default App;
