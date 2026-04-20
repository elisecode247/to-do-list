import "src/google-authorization/google-calendar-status.css";
import { useAuthentication } from "src/authentication/use-authentication";
import { useGoogleCalendar } from "src/google-authorization/use-google-calendar";
import GoogleCalendarConnectButton from "src/google-authorization/google-calendar-button";
import { CalendarSync, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "src/toast/use-toast";

const GoogleCalendarStatus = () => {
    const { isAuthenticated } = useAuthentication();
    const { loading, connected, refreshStatus, disconnectCalendar, isError, setIsError } = useGoogleCalendar();
    const { showToast } = useToast();
    const hasShownConnectionErrorRef = useRef(false);
    const didMountRef = useRef(false);

    function handleSuccess() {
        hasShownConnectionErrorRef.current = false;
        setIsError(false);
        refreshStatus();
    }

    async function handleDisconnect() {
        hasShownConnectionErrorRef.current = false;
        setIsError(false);
        await disconnectCalendar();
    }

    function handleConnectionError(err: unknown) {
        setIsError(true);
        console.error("Error connecting to Google Calendar:", err);
        if (!hasShownConnectionErrorRef.current) {
            showToast("There was an error connecting to Google Calendar. Please try again.");
            hasShownConnectionErrorRef.current = true;
        }
    }

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }

        if (!isError) {
            hasShownConnectionErrorRef.current = false;
        }
    }, [isError]);

    if (loading) return null;
    if (!isAuthenticated) return null;

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
            {!isError ? (
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
                            onClick={handleDisconnect}
                        >
                            Disconnect Calendar
                        </button>
                    ) : (
                        <GoogleCalendarConnectButton
                            onSuccess={handleSuccess}
                            onError={(err) => handleConnectionError(err)}
                        />
                    )}
                </div>
            </div>
            ) : (
                <div className="settings-panel">
                    <div className="settings-panel-header">
                        <h4>Google Calendar</h4>
                        <p>There was an error checking your calendar connection. Please try again.</p>
                    </div>

                    <div className="settings-panel-actions">
                        <button
                            type="button"
                            className="settings-btn settings-btn--secondary"
                            onClick={() => {
                                refreshStatus();
                            }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleCalendarStatus;
