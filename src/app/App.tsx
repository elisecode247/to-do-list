import { lazy, type FC } from 'react';
import './app.css';
import './settings.css';
import { useUserSettings } from 'src/user-settings/use-user-settings';
import { useAuthentication } from 'src/authentication/use-authentication';
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

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
        }
        catch (err) {
            console.error(err);
        }
    };

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
