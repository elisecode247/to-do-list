import type { ReactNode } from 'react';
import { GoogleCalendarProvider } from 'src/google-authorization/google-calendar-provider';
import { useUserSettings } from 'src/user-settings/use-user-settings';

export default function GoogleCalendarProviderGate({ children }: { children: ReactNode }) {
    const { googleCalendarEnabled } = useUserSettings();

    if (!googleCalendarEnabled) {
        return <>{children}</>;
    }

    return <GoogleCalendarProvider>{children}</GoogleCalendarProvider>;
}
