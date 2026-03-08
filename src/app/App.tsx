import { lazy, Suspense, useState, type FC } from 'react';
import './app.css';
import './settings.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import LoggedOut from 'src/pages/logged-out/LoggedOut';
import LoggedIn from 'src/pages/logged-in/LoggedIn';
import SkeletonAppPage from 'src/themes/AppSkeleton';
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

const App: FC = () => {
    const { isAuthenticated, login } = useAuthentication();
    const [cachedNotes, setCachedNotes] = useState<string | null>(null);

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
                {!isAuthenticated ? (
                    <LoggedOut onSuccessfulLogin={handleLoginSuccess} />
                ) : (
                    <LoggedIn
                        cachedNotes={cachedNotes}
                        setCachedNotes={setCachedNotes}
                    />
                )}
            </Route>
            <Route path={ROUTES.demo}>
                <Suspense fallback={<SkeletonAppPage />}>
                    <DemoPageLazy />
                </Suspense>
            </Route>
            <Route path={ROUTES.userSettings}>
                <UserSettingsLazy />
            </Route>
            <Route path={ROUTES.bulkEdit}>
                <BulkEditLazy />
            </Route>
            <Route>
                <NotFoundLazy />
            </Route>
        </Switch>
    );
};

export default App;
