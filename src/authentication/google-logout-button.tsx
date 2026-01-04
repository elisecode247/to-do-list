import React from "react";
import 'src/authentication/authentication.css';
import { logout } from "./authentication-api";
import { LogOut } from 'lucide-react';

const GoogleLogoutButton: React.FC = () => {
    const handleLogout = () => {
        // Revoke Google session if available
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }

        // Call the parent's logout handler
        logout();
    };

    return (
        <button
            onClick={handleLogout}
            className="google-logout"
        >
            <LogOut size={16} />
            Sign out
        </button>
    );
};

export default GoogleLogoutButton;
