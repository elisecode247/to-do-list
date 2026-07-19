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
import SharingSettings from "src/pages/user-settings/SharingSettings";

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
            <section className="settings-category" aria-labelledby="personalization-settings-title">
                <h2 id="personalization-settings-title" className="settings-category-title">Personalization</h2>
                <AppearanceSettings />
                <CategorySettings />
            </section>
            <section className="settings-category" aria-labelledby="sharing-settings-title">
                <h2 id="sharing-settings-title" className="settings-category-title">Sharing</h2>
                <SharingSettings />
            </section>
            <section className="settings-category" aria-labelledby="integration-settings-title">
                <h2 id="integration-settings-title" className="settings-category-title">Integrations</h2>
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
            </section>
            <section className="settings-category" aria-labelledby="data-privacy-settings-title">
                <h2 id="data-privacy-settings-title" className="settings-category-title">Data &amp; Privacy</h2>
                <EncryptionSettings />
                <JournalExportSettings />
            </section>
            <section className="settings-category" aria-labelledby="account-settings-title">
                <h2 id="account-settings-title" className="settings-category-title">Account</h2>
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
            </section>
            {isDeleteAccountDialogOpen ? (
                <DeleteAccountDialog isOpen={isDeleteAccountDialogOpen} onClose={() => setIsDeleteAccountDialogOpen(false)} />
            ) : null}
        </Page>
    );
}

export default UserSettings;
