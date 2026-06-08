import { lazy, useEffect, type FC } from 'react';
import './app.css';
import './settings.css';
import { useTask } from 'src/app/use-task';
import { useUserSettings } from 'src/user-settings/use-user-settings';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import LoggedOut from 'src/pages/logged-out/LoggedOut';
import LoggedIn from 'src/pages/logged-in/LoggedIn';
import { Route, Switch } from "wouter";
import { ROUTES } from 'src/router';
import 'app/app.css';

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

const App: FC = () => {
    const { isAuthenticated, isLoading, login } = useAuthentication();
    const { googleCalendarEnabled, isLoadingSettings, updateEnableCalendar } = useUserSettings();
    const { loadTasks, loadDate } = useTask();
    const { loadCalendarEvents } = useGoogleCalendar();

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
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

            if (loadDate && 'current' in loadDate) {
                loadDate.current = new Date();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isAuthenticated, googleCalendarEnabled, loadDate, loadTasks, loadCalendarEvents]);

    return (

        <Switch>
            <Route path={ROUTES.home}>
                {isLoading ? null :
                !isAuthenticated ? (
                    <LoggedOut onSuccessfulLogin={handleLoginSuccess} />
                ) : (
                    <LoggedIn />
                )}
            </Route>
            <Route path={ROUTES.demo}>
                {/** Demo page is faster without Suspense */}
                <DemoPageLazy />
            </Route>
            <Route path={ROUTES.userSettings}>
                <UserSettingsLazy
                    googleCalendarEnabled={googleCalendarEnabled}
                    isLoadingSettings={isLoadingSettings}
                    updateEnableCalendar={updateEnableCalendar} />
            </Route>
            <Route path={ROUTES.bulkEdit}>
                <BulkEditLazy />
            </Route>
            <Route path={ROUTES.privacyPolicy}>
                <PrivacyPolicyLazy />
            </Route>
            <Route>
                <NotFoundLazy />
            </Route>
        </Switch>
    );
};

export default App;
