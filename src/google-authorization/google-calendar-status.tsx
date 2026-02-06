import "src/google-authorization/google-calendar-status.css";
import { useAuthentication } from "src/authentication/use-authentication";
import { useCalendarIntegration } from "./use-google-calendar";
import GoogleCalendarConnectButton from "src/google-authorization/google-calendar-button";
import { CalendarSync, CheckCircle2 } from "lucide-react";
import { useToast } from "src/toast/use-toast";

const GoogleCalendarStatus = () => {
    const { isAuthenticated } = useAuthentication();
    const { loading, connected, refreshStatus, disconnectCalendar } = useCalendarIntegration();
    const { showToast } = useToast();

    if (loading) return null;
    if (!isAuthenticated) return null;

    function handleConnectionError(err: unknown) {
        console.error("Error connecting to Google Calendar:", err);
        showToast("There was an error connecting to Google Calendar. Please try again.");
    }

    return (
        <div className="settings-dropdown">
            <button
                type="button"
                className="settings-btn"
                aria-haspopup="true"
                aria-expanded={connected}
            >
                {connected ? (
                    <>
                        <CheckCircle2 size={14} />
                        <span>Calendar Connected</span>
                    </>
                ) : (
                    <>
                        <CalendarSync size={14} />
                        <span>Calendar Not Connected</span>
                    </>
                )}
            </button>

            <div className="settings-panel">
                <div className="settings-panel-header">
                    <h4>Google Calendar</h4>
                    <p>Sync chores with due dates to your calendar.</p>
                </div>

                <div className="settings-panel-actions">
                    {connected ? (
                        <button
                            type="button"
                            className="settings-btn settings-btn--secondary"
                            onClick={disconnectCalendar}
                        >
                            Disconnect Calendar
                        </button>
                    ) : (
                        <GoogleCalendarConnectButton
                            onSuccess={refreshStatus}
                            onError={(err) => handleConnectionError(err)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoogleCalendarStatus;
