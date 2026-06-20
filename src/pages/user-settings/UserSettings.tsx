import './user-settings.css';
import AppearanceSettings from "src/pages/user-settings/AppearanceSettings";
import { useTheme } from "src/themes/use-theme";
import { useState } from "react";
import DeleteAccountDialog from "./DeleteAccountDialog";
import Page from "../Page";

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
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

    function openDeleteAccountDialog() {
        setIsDeleteAccountDialogOpen(true);
    }


    if (isLoadingSettings) {
        return (
            <div className="app_loading-container">
                <div aria-busy="true" className="app_loading-spinner"></div>
            </div>
        );
    }
    return (
        <Page title="User Settings">
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
                <div className="settings-section">
                    <h3 className="settings-section-title">Danger Zone</h3>
                    <p className="settings-section-description">Delete your account and all your data. This action cannot be undone.</p>
                    <button className="settings-btn settings-btn--danger" type="button" onClick={openDeleteAccountDialog}>
                        Delete Account
                    </button>
                </div>
                {isDeleteAccountDialogOpen ? (
                    <DeleteAccountDialog isOpen={isDeleteAccountDialogOpen} onClose={() => setIsDeleteAccountDialogOpen(false)} />
                ) : null}
                {isDeleteAccountDialogOpen && "open"}
        </Page>
    );
}

export default UserSettings;
