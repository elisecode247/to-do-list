import { useRef, useEffect, useState } from "react";
import { MenuSquare } from 'lucide-react';
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import GoogleCalendarStatus from 'src/google-authorization/google-calendar-status';
import { useAuthentication } from "src/authentication/use-authentication";
import { useTask } from "./use-task";

interface AccountMenuProps {
    onLogout: () => void;
}
function AccountMenu({ onLogout: onAppLogout }: AccountMenuProps) {
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { email, logout } = useAuthentication();
    const { reset } = useTask();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsSettingOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);



    function handleLogout() {
        logout();
        reset();
        onAppLogout()
    }

    const handleLogoutClick = () => {
        handleLogout();
    };

    return (
        <div ref={menuRef}>
            <button
                aria-label="Account menu"
                onClick={() => setIsSettingOpen(prev => !prev)}
                className="app_header_menu"
            >
                <span className="app_header_menu-span">Menu</span>
                <MenuSquare className="app_header_menu-icon" />
            </button>

            {isSettingOpen && (
                (
                    <div className="app_header_settings">
                        <div className="app_header_button-group">
                            <GoogleLogoutButton onLogout={handleLogoutClick} email={email} />
                            <GoogleCalendarStatus />
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default AccountMenu;
