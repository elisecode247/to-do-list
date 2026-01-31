import { useState } from 'react';
import 'src/google-authorization/google-calendar-status.css';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useCalendarIntegration } from './use-google-calendar';
import GoogleCalendarConnectButton from 'src/google-authorization/google-calendar-button';
import { CalendarSync } from 'lucide-react';

const GoogleCalendarStatus = () => {
    const { isAuthenticated } = useAuthentication();
    const { loading, connected } = useCalendarIntegration();
    const [modalOpen, setModalOpen] = useState(false);

    if (loading) return null;
    if (!isAuthenticated) return null;

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

            {!connected && modalOpen && (
                <div className="calendar-modal">
                    <button
                        className="calendar-modal-close"
                        onClick={() => setModalOpen(false)}
                    >
                        ×
                    </button>
                    <p className="calendar-help">
                        Sync chores with due dates to your Google Calendar.
                    </p>
                    <GoogleCalendarConnectButton />
                </div>
            )}
        </div>
    );
};

export default GoogleCalendarStatus;
