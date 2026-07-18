import { lazy, useEffect, useLayoutEffect, type FC } from 'react';
import './app.css';
import './settings.css';
import { useTask } from 'src/app/use-task';
import { useUserSettings } from 'src/user-settings/use-user-settings';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import LoggedOut from 'src/pages/logged-out/LoggedOut';
import LoggedIn from 'src/pages/logged-in/LoggedIn';
import { Route, Switch, useLocation } from "wouter";
import { ROUTES } from 'src/router';
import 'app/app.css';
import ThemeCanvas from './ThemeCanvas';

const DemoPageLazy = lazy(async () => {
    return { default: (await import('src/pages/demo/DemoPage')).default };
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
    const { googleCalendarEnabled, isLoadingSettings } = useUserSettings();
    const { loadTasks, loadDate } = useTask();
    const { loadCalendarEvents } = useGoogleCalendar();
    const [, setLocation] = useLocation();

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
            setLocation(ROUTES.home);
        }
        catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibility = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            const staleAfter = 5 * 60 * 1000;
            const lastLoad = loadDate && 'current' in loadDate ? loadDate.current : null;
            const isStale = !lastLoad || Date.now() - lastLoad.getTime() > staleAfter;

            if (!isStale) {
                return;
            }

            loadTasks();
            if (googleCalendarEnabled) {
                loadCalendarEvents();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isAuthenticated, googleCalendarEnabled, loadDate, loadTasks, loadCalendarEvents]);

    useLayoutEffect(() => {
        if (!isLoading) {
            document.documentElement.removeAttribute('data-auth-session-hint');
        }
    }, [isLoading]);

    return (

        <>
            <ThemeCanvas />
            <Switch>
                <Route path={ROUTES.home}>
                    {!isAuthenticated ? (
                            <LoggedOut
                                isCheckingSession={isLoading}
                                onSuccessfulLogin={handleLoginSuccess}
                            />
                        ) : (
                            <LoggedIn />
                        )
                    }
                </Route>
                <Route path={ROUTES.demo}>
                    {/** Demo page is faster without Suspense */}
                    <DemoPageLazy onSuccessfulLogin={handleLoginSuccess} />
                </Route>
                <Route path={ROUTES.userSettings}>
                    {isLoading || isLoadingSettings ? <LoadingSpinner /> :
                        isAuthenticated ? (
                            <UserSettingsLazy />
                        ) : <NotFoundLazy />}
                </Route>
                <Route path={ROUTES.bulkEdit}>
                    {isLoading ? <LoadingSpinner /> :
                        isAuthenticated ? (
                            <BulkEditLazy />
                        ) : <NotFoundLazy />}
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
