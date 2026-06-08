import { useRef } from "react";
import { Menu } from 'lucide-react';
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import GoogleCalendarStatus from 'src/google-authorization/google-calendar-status';
import { useAuthentication } from "src/authentication/use-authentication";
import { useTask } from "./use-task";
import { Link, useLocation } from "wouter";
import { ROUTES } from "src/router";
import { createPortal } from 'react-dom';
import { useOnClickOutside } from "usehooks-ts";
import IconButton from 'src/components/icon-button/IconButton';
import { useUserSettings } from "src/user-settings/use-user-settings";

interface AccountMenuProps {
    isMenuOpen: boolean;
    onMenuToggleOpen: () => void;
    onMenuClose: () => void;
    isDesktop?: boolean;
}

function AccountMenu({
    isMenuOpen,
    onMenuToggleOpen,
    onMenuClose,
    isDesktop
}: AccountMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { email, logout, isAuthenticated } = useAuthentication();
    const { googleCalendarEnabled } = useUserSettings();
    const { reset } = useTask();
    const [location] = useLocation();

    function handleLogout() {
        logout();
        reset();
    }

    const handleLogoutClick = () => {
        handleLogout();
    };

    useOnClickOutside(dropdownRef as React.RefObject<HTMLDivElement>, () => {
        if (isMenuOpen) onMenuClose();
    });

    if (!isAuthenticated) return null

    return (
        <div className="account-menu-container" ref={menuRef}>
            <IconButton
                className="app_header_menu"
                onClick={onMenuToggleOpen}
                label="Menu"
                ariaLabel="Account menu"
                icon={<Menu className="app_header_menu-icon" size={24} />}
                showLabel={isDesktop}
            />

            {isMenuOpen && isAuthenticated ? createPortal(
                <div ref={dropdownRef} className="app_header_settings">
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
                        <Link href={ROUTES.privacyPolicy}
                            id="privacy-policy-link"
                            className="settings-btn"
                        >
                            Privacy Policy
                        </Link>
                        {googleCalendarEnabled && (
                            <GoogleCalendarStatus />
                        )}
                    </div>
                </div>
                , document.body) : null}
        </div>
    );
}

export default AccountMenu;
