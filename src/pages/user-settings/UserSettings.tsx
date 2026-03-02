import AccountMenu from "src/app/AccountMenu";
import { Link, useLocation } from "wouter";
import { Home } from "lucide-react";
import { ROUTES } from "src/router";
import './UserSettings.css';
import AppearanceSettings from "src/pages/user-settings/AppearanceSettings";
import { useTheme } from "src/themes/use-theme";
import { useState } from "react";

function UserSettings() {
    useTheme();
    const [location] = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

     function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }
    return (
        <div className="app_container">
            <header className="app_header">
                <h1 className="app_h1">Daily Reset</h1>
                <AccountMenu isMenuOpen={isMenuOpen} onMenuToggleOpen={toggleMenu} onMenuClose={() => setIsMenuOpen(false)}
                />
            </header>
            <div className="user-settings-container">
                {location !== ROUTES.home && (
                    <Link href={ROUTES.home} className="settings-btn settings-btn--primary">
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
