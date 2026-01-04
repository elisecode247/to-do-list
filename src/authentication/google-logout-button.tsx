import React from "react";
import 'src/authentication/authentication.css';
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
            className="google-logout"
        >
            <LogOut size={16} />
            Log out
        </button>
    );
};

export default GoogleLogoutButton;
