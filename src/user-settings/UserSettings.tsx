import AccountMenu from "src/app/AccountMenu";
import { Link, useLocation } from "wouter";
import { Home } from "lucide-react";
import { ROUTES } from "src/router";
import './UserSettings.css';
import AppearanceSettings from "src/user-settings/AppearanceSettings";

function UserSettings() {
    const [location] = useLocation();
    return (
        <div className="app_container">
            <header className="app_header">
                <h1 className="app_h1">For My Today</h1>
                <AccountMenu />
            </header>
            <div className="user-settings-container">
                {location !== ROUTES.home && (
                    <Link href={ROUTES.home} className="settings-btn">
                        <Home size={24} />
                        <span>Back to Home</span>
                    </Link>
                )}
                <h2 className="app_h2">User Settings</h2>
                <AppearanceSettings />
            </div>
        </div>
    );
}

export default UserSettings;
