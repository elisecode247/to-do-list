import { useEffect, useState } from "react";
import { API_AUTH_URL } from "src/app/constants";
import GoogleCalendarContext from "./google-calendar-context";

export function GoogleCalendarProvider({ children }: { children: React.ReactNode }) {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_AUTH_URL}/google-client-id`)
      .then(res => res.json())
      .then(data => setClientId(data.clientId));
  }, []);

  return (
    <GoogleCalendarContext.Provider value={clientId}>
      {children}
    </GoogleCalendarContext.Provider>
  );
}
