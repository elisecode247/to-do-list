import { useState } from 'react';
import 'src/google-authorization/google-calendar-status.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useCalendarIntegration } from './use-google-calendar';
import GoogleCalendarConnectButton from 'src/google-authorization/google-calendar-button';
import { CalendarSync } from 'lucide-react';
import { useToast } from 'src/toast/use-toast';

const GoogleCalendarStatus = () => {
    const { isAuthenticated } = useAuthentication();
    const { loading, connected, refreshStatus, disconnectCalendar } = useCalendarIntegration();
    const [modalOpen, setModalOpen] = useState(false);
    const { showToast } = useToast();

    if (loading) return null;
    if (!isAuthenticated) return null;

    function handleConnectionError(err: unknown) {
        console.error('Error connecting to Google Calendar:', err);
        showToast('There was an error connecting to Google Calendar. Please try again.');
    }
    return (
        <div className="calendar-integration">
            <div className="calendar-header">
                {connected ? (
                    <span className="calendar-status connected">
                        ✓ Calendar Connected
                    </span>
                ) : (
                    <span
                        className="calendar-status disconnected"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setModalOpen(!modalOpen)}
                    >
                        <CalendarSync size={12} style={{ marginRight: 4 }} />
                        Calendar Not Connected
                    </span>
                )}
            </div>
            {connected && (
                <button
                    onClick={() => disconnectCalendar()}
                    className="calendar-disconnect-button"
                >
                    Disconnect Calendar
                </button>
            )}

            {!connected && (
                <>
                    <p className="calendar-help">
                        Sync chores with due dates to your Google Calendar.
                    </p>
                    <GoogleCalendarConnectButton
                        onSuccess={refreshStatus}
                        onError={handleConnectionError}
                    />
                </>
            )}
        </div>
    );
};

export default GoogleCalendarStatus;
