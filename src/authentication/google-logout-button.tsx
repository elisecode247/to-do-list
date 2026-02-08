import React from "react";
import { LogOut } from "lucide-react";

interface GoogleLogoutButtonProps {
    onLogout: () => void;
    email?: string;
}

const GoogleLogoutButton: React.FC<GoogleLogoutButtonProps> = ({
    onLogout,
    email
}) => {
    const isEmail = email !== 'undefined';
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
            className="settings-btn settings-btn--primary"
            type="button"
        >
            <LogOut size={16} />
            <div className="settings-btn-text-wrapper">
                <span className="settings-btn-title">Log out</span>
                {isEmail && <span className="settings-btn-subtitle">{email}</span>}
            </div>
        </button>
    );
};

export default GoogleLogoutButton;
