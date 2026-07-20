import './user-settings.css';
import AppearanceSettings from "src/pages/user-settings/AppearanceSettings";
import { useTheme } from "src/themes/use-theme";
import { useEffect, useRef, useState } from "react";
import DeleteAccountDialog from "./DeleteAccountDialog";
import Page from "../Page";
import { Skull } from 'lucide-react';
import EncryptionSettings from "src/user-settings/EncryptionSettings";
import JournalExportSettings from "src/user-settings/JournalExportSettings";
import { useUserSettings } from "src/user-settings/use-user-settings";
import CategorySettings from "src/pages/user-settings/CategorySettings";
import SharingSettings from "src/pages/user-settings/SharingSettings";

const SETTINGS_SECTIONS = [
    { id: 'personalization-settings', label: 'Personalization' },
    { id: 'sharing-settings', label: 'Sharing' },
    { id: 'integration-settings', label: 'Integrations' },
    { id: 'data-privacy-settings', label: 'Data & Privacy' },
    { id: 'account-settings', label: 'Account' },
] as const;
type SettingsSectionId = typeof SETTINGS_SECTIONS[number]['id'];

function UserSettings() {
    useTheme();
    const {
        googleCalendarEnabled,
        updateEnableCalendar
    } = useUserSettings();
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<SettingsSectionId>(SETTINGS_SECTIONS[0].id);
    const settingsLayoutRef = useRef<HTMLDivElement>(null);
    const settingsNavListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const settingsLayout = settingsLayoutRef.current;
        const scrollContainer = settingsLayout?.closest<HTMLElement>('.page-content');
        if (!settingsLayout || !scrollContainer) return;

        const sectionElements = SETTINGS_SECTIONS
            .map(section => settingsLayout.querySelector<HTMLElement>(`#${section.id}`))
            .filter((section): section is HTMLElement => section !== null);

        let animationFrame: number | null = null;
        const updateActiveSection = () => {
            animationFrame = null;
            const containerRect = scrollContainer.getBoundingClientRect();
            const activationLine = containerRect.top + Math.min(140, containerRect.height * 0.25);
            let nextSection = (sectionElements[0]?.id ?? SETTINGS_SECTIONS[0].id) as SettingsSectionId;

            for (const section of sectionElements) {
                if (section.getBoundingClientRect().top <= activationLine) {
                    nextSection = section.id as SettingsSectionId;
                } else {
                    break;
                }
            }

            const isAtBottom =
                scrollContainer.scrollTop + scrollContainer.clientHeight
                >= scrollContainer.scrollHeight - 2;
            if (isAtBottom && sectionElements.length) {
                nextSection = sectionElements[sectionElements.length - 1].id as SettingsSectionId;
            }

            setActiveSection(current => current === nextSection ? current : nextSection);
        };

        const scheduleActiveSectionUpdate = () => {
            if (animationFrame === null) {
                animationFrame = window.requestAnimationFrame(updateActiveSection);
            }
        };

        scheduleActiveSectionUpdate();
        scrollContainer.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
        window.addEventListener('resize', scheduleActiveSectionUpdate);

        return () => {
            scrollContainer.removeEventListener('scroll', scheduleActiveSectionUpdate);
            window.removeEventListener('resize', scheduleActiveSectionUpdate);
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, []);

    useEffect(() => {
        const navList = settingsNavListRef.current;
        const activeLink = navList?.querySelector<HTMLElement>(`[href="#${activeSection}"]`);
        if (!navList || !activeLink) return;

        const navRect = navList.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        if (linkRect.left < navRect.left) {
            navList.scrollBy({ left: linkRect.left - navRect.left - 8 });
        } else if (linkRect.right > navRect.right) {
            navList.scrollBy({ left: linkRect.right - navRect.right + 8 });
        }
    }, [activeSection]);

    function openDeleteAccountDialog() {
        setIsDeleteAccountDialogOpen(true);
    }

    return (
        <Page title="User Settings">
            <div className="settings-layout" ref={settingsLayoutRef}>
                <nav className="settings-nav" aria-label="Settings sections">
                    <div className="settings-nav-list" ref={settingsNavListRef}>
                        {SETTINGS_SECTIONS.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`settings-nav-link ${activeSection === section.id ? 'active' : ''}`}
                                aria-current={activeSection === section.id ? 'location' : undefined}
                                onClick={() => setActiveSection(section.id)}
                            >
                                {section.label}
                            </a>
                        ))}
                    </div>
                </nav>
                <div className="settings-content">
                    <section
                        id="personalization-settings"
                        className="settings-category"
                        aria-labelledby="personalization-settings-title"
                    >
                        <h2 id="personalization-settings-title" className="settings-category-title">Personalization</h2>
                        <AppearanceSettings />
                        <CategorySettings />
                    </section>
                    <section
                        id="sharing-settings"
                        className="settings-category"
                        aria-labelledby="sharing-settings-title"
                    >
                        <h2 id="sharing-settings-title" className="settings-category-title">Sharing</h2>
                        <SharingSettings />
                    </section>
                    <section
                        id="integration-settings"
                        className="settings-category"
                        aria-labelledby="integration-settings-title"
                    >
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
                    <section
                        id="data-privacy-settings"
                        className="settings-category"
                        aria-labelledby="data-privacy-settings-title"
                    >
                        <h2 id="data-privacy-settings-title" className="settings-category-title">Data &amp; Privacy</h2>
                        <EncryptionSettings />
                        <JournalExportSettings />
                    </section>
                    <section
                        id="account-settings"
                        className="settings-category"
                        aria-labelledby="account-settings-title"
                    >
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
                </div>
            </div>
            {isDeleteAccountDialogOpen ? (
                <DeleteAccountDialog isOpen={isDeleteAccountDialogOpen} onClose={() => setIsDeleteAccountDialogOpen(false)} />
            ) : null}
        </Page>
    );
}

export default UserSettings;
