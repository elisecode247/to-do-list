import { lazy, Suspense, useEffect, type FC } from 'react';
import './app.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import LoggedOut from 'src/pages/logged-out/LoggedOut';
import { Redirect, Route, Switch, useLocation } from "wouter";
import { ROUTES } from 'src/router';
import ThemeCanvas from './ThemeCanvas';

const LoggedInLazy = lazy(() => import('src/pages/logged-in/LoggedIn'));
const DemoPageLazy = lazy(() => import('src/pages/demo/DemoPage'));

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
    const [location, setLocation] = useLocation();

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
            setLocation(ROUTES.app);
        }
        catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (location === ROUTES.home) return;

        const idleWindow = window as Window & {
            requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
            cancelIdleCallback?: (handle: number) => void;
        };
        const initializeSentry = () => void import('./initialize-sentry');

        if (idleWindow.requestIdleCallback) {
            const handle = idleWindow.requestIdleCallback(initializeSentry, { timeout: 3000 });
            return () => idleWindow.cancelIdleCallback?.(handle);
        }

        const handle = window.setTimeout(initializeSentry, 2000);
        return () => window.clearTimeout(handle);
    }, [location]);

    return (

        <>
            <ThemeCanvas />
            <Suspense fallback={<LoadingSpinner />}>
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
                            <LoggedInLazy />
                        ) : <Redirect to={ROUTES.home} replace />}
                </Route>
                <Route path={ROUTES.demo}>
                    <DemoPageLazy onSuccessfulLogin={handleLoginSuccess} />
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
            </Suspense>
        </>
    );
};

export default App;
