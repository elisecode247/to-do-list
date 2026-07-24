import { useUserSettings } from 'src/user-settings/use-user-settings';

const JournalTypeSettings = () => {
        const {
            interstitialJournalEnabled,
            updateInterstitialJournalEnabled,
        } = useUserSettings();
    return (
        <section
        id="journal-type-settings"
        className="settings-category"
        aria-labelledby="journal-type-settings-title"
    >
        <h2 id="journal-type-settings-title" className="settings-category-title">Journal Type</h2>
        <div className="settings-section">
            <h3 className="settings-section-title">Select Journal Type</h3>
            <p className="settings-section-description">
                Choose the type of journal you want to use.
            </p>
            <div className="radio-group" role="radiogroup">
                <label className="radio-option">
                    <input
                        type="radio"
                        name="journal-type"
                        value="interstitial"
                        checked={interstitialJournalEnabled}
                        onChange={() => updateInterstitialJournalEnabled(true)}
                    />
                    <span>Interstitial Journal</span>
                </label>
                <label className="radio-option">
                    <input
                        type="radio"
                        name="journal-type"
                        value="standard"
                        checked={!interstitialJournalEnabled}
                        onChange={() => updateInterstitialJournalEnabled(false)}
                    />
                    <span>Standard Journal</span>
                </label>
            </div>
            <p>
                {interstitialJournalEnabled ? (
                    <>
                    You have selected the Interstitial Journal. This type of journal helps with task switching and procrastination.
                    </>
                ) : (
                    <>
                    You have selected the Standard Journal. This type of journal is suitable for regular journaling without specific focus on task switching.
                    </>
                )}
            </p>
        </div>
    </section>
    );
};

export default JournalTypeSettings;
