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
import { AnimatePresence, motion } from 'framer-motion';

interface AccountMenuProps {
    isMenuOpen: boolean;
    onMenuToggleOpen: () => void;
    onMenuClose: () => void;
}

function AccountMenu({
    isMenuOpen,
    onMenuToggleOpen,
    onMenuClose
}: AccountMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { email, logout, isAuthenticated } = useAuthentication();
    const { googleCalendarEnabled } = useUserSettings();
    const { reset } = useTask();
    const [location, setLocation] = useLocation();

    function handleLogout() {
        logout();
        reset();
        setLocation("/");
    }

    const handleLogoutClick = () => {
        handleLogout();
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent | FocusEvent) => {
        const target = event.target as Node | null;
        if (target && menuRef.current?.contains(target)) {
            return;
        }
        if (isMenuOpen) onMenuClose();
    }

    const handleClickInside = () => {
        onMenuToggleOpen();
    }

    useOnClickOutside(dropdownRef as React.RefObject<HTMLDivElement>, handleClickOutside);

    if (!isAuthenticated) return null

    return (
        <div className="account-menu-container" ref={menuRef}>
            <IconButton
                className="app_header_menu"
                onClick={handleClickInside}
                label="Menu"
                ariaLabel="Account menu"
                icon={<Menu className="app_header_menu-icon" size={24} />}
                showLabel={false}
            />

            {isAuthenticated ? createPortal(
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            ref={dropdownRef}
                            className="app_header_settings"
                            dir="auto"
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
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
                                {location !== ROUTES.templates && (
                                    <Link href={ROUTES.templates}
                                        id="templates-link"
                                        className="settings-btn"
                                    >
                                        Templates
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
                                <a
                                    href="https://buymeacoffee.com/elisestraub"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="settings-btn buy-coffee-button"
                                >
                                    ☕ Buy me a coffee
                                </a>

                                {googleCalendarEnabled && (
                                    <GoogleCalendarStatus />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                , document.body) : null}
        </div>
    );
}

export default AccountMenu;
