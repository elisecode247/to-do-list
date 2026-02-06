import React from "react";
import { LogOut } from "lucide-react";

interface GoogleLogoutButtonProps {
    onLogout: () => void;
}

const GoogleLogoutButton: React.FC<GoogleLogoutButtonProps> = ({
    onLogout
}) => {
    const handleLogout = () => {
        // Revoke Google session if available
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }

        onLogout();
    };

    return (
        <button
            onClick={handleLogout}
            className="settings-btn settings-btn--danger"
            type="button"
        >
            <LogOut size={16} />
            <span>Log out</span>
        </button>
    );
};

export default GoogleLogoutButton;
