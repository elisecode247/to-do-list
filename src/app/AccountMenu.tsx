import { useRef, useState } from "react";
import { MenuSquare } from 'lucide-react';
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import GoogleCalendarStatus from 'src/google-authorization/google-calendar-status';
import { useAuthentication } from "src/authentication/use-authentication";
import { useTask } from "./use-task";
import { Link, useLocation } from "wouter";
import { ROUTES } from "src/router";
import { createPortal } from 'react-dom';


function AccountMenu() {
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { email, logout, isAuthenticated } = useAuthentication();
    const { reset } = useTask();
    const [location] = useLocation();

    function handleLogout() {
        logout();
        reset();
    }

    const handleLogoutClick = () => {
        handleLogout();
    };

    if (!isAuthenticated) return null

    return (
        <div className="account-menu-container" ref={menuRef}>
            <button
                aria-label="Account menu"
                onClick={() => setIsSettingOpen(prev => !prev)}
                className="app_header_menu"
            >
                <MenuSquare className="app_header_menu-icon" size={24} />
                <span className="app_header_menu-span">Menu</span>
            </button>

            {isSettingOpen && isAuthenticated ? createPortal(
                <div className="app_header_settings">
                    <div className="app_header_button-group">
                        <GoogleLogoutButton onLogout={handleLogoutClick} email={email} />
                        {location !== ROUTES.userSettings && (
                            <Link href={ROUTES.userSettings}
                                id="user-settings-button"
                                className="settings-btn"
                            >
                                User Settings
                            </Link>
                        )}
                        {location !== ROUTES.bulkEdit && (
                            <Link href={ROUTES.bulkEdit}
                                id="bulk-edit-link"
                                className="settings-btn"
                            >
                                Bulk Edit
                            </Link>
                        )}
                        <GoogleCalendarStatus />
                    </div>
                </div>
                , document.body) : null}
        </div>
    );
}

export default AccountMenu;
