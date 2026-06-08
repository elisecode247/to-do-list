import AccountMenu from "src/app/AccountMenu";
import { Link, useLocation } from "wouter";
import { Home } from "lucide-react";
import { ROUTES } from "src/router";
import './UserSettings.css';
import AppearanceSettings from "src/pages/user-settings/AppearanceSettings";
import { useTheme } from "src/themes/use-theme";
import { useState } from "react";

interface UserSettingsProps {
    googleCalendarEnabled: boolean;
    isLoadingSettings: boolean;
    updateEnableCalendar: (nextValue: boolean) => Promise<void>;
}
function UserSettings({
    googleCalendarEnabled,
    isLoadingSettings,
    updateEnableCalendar
}: UserSettingsProps) {
    useTheme();
    const [location] = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }

    if (isLoadingSettings) {
        return (
            <div className="app_loading-container">
                <div aria-busy="true" className="app_loading-spinner"></div>
            </div>
        );
    }
    return (
        <div>
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
                <div className="settings-section">
                    <h3 className="settings-section-title">Enable Google Calendar</h3>
                    <div className="radio-group" role="radiogroup">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="enable-calendar"
                                checked={googleCalendarEnabled === true}
                                onChange={() => void updateEnableCalendar(true)}
                            />
                            <span>Enable</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="enable-calendar"
                                checked={googleCalendarEnabled === false}
                                onChange={() => void updateEnableCalendar(false)}
                            />
                            <span>Disable</span>
                        </label>
                    </div>
                </div>
                <AppearanceSettings />
            </div>
        </div>
    );
}

export default UserSettings;
