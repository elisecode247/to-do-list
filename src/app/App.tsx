import { type FC } from 'react';
import './app.css';
import './settings.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import LoggedOut from 'src/logged-out/LoggedOut';
import LoggedIn from 'src/logged-in/LoggedIn';
import DemoPage from 'src/demo/DemoPage';
import NotFound from 'src/not-found/NotFound';
import { Route, Switch } from "wouter";
import { ROUTES } from 'src/router';
import UserSettings from 'src/user-settings/UserSettings';
import 'src/themes/themes.css';

const App: FC = () => {
    const { isAuthenticated, login } = useAuthentication();

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
                ) : <LoggedIn />}
            </Route>
            <Route path={ROUTES.demo} component={DemoPage} />
            <Route path={ROUTES.userSettings} component={UserSettings} />
            <Route>
                <NotFound />
            </Route>
        </Switch>
    );
};

export default App;
