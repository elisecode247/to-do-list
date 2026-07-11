import './user-settings.css';
import AppearanceSettings from "src/pages/user-settings/AppearanceSettings";
import { useTheme } from "src/themes/use-theme";
import { useState } from "react";
import DeleteAccountDialog from "./DeleteAccountDialog";
import Page from "../Page";
import { Skull } from 'lucide-react';
import EncryptionSettings from "src/user-settings/EncryptionSettings";
import JournalExportSettings from "src/user-settings/JournalExportSettings";
import { useUserSettings } from "src/user-settings/use-user-settings";
import CategorySettings from "src/pages/user-settings/CategorySettings";

function UserSettings() {
    useTheme();
    const {
        googleCalendarEnabled,
        updateEnableCalendar
    } = useUserSettings();
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

    function openDeleteAccountDialog() {
        setIsDeleteAccountDialogOpen(true);
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
                <EncryptionSettings />
                <JournalExportSettings />
                <AppearanceSettings />
                <CategorySettings />
                <div className="settings-section settings-section--danger">
                    <h3 className="settings-section-title settings-section-title--danger">
                        <Skull size={20} className="settings-section-icon--danger" />
                        Danger Zone
                    </h3>
                    <p className="settings-section-description">Delete your account and all your data. This action cannot be undone.</p>
                    <button className="settings-btn settings-btn--danger" type="button" onClick={openDeleteAccountDialog}>
                        <Skull size={20} className="settings-btn-icon--danger" />
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
