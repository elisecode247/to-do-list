import { createContext, useContext } from "react";

const ClientIdContext = createContext<string | null>(null);

export function useClientId() {
  const context = useContext(ClientIdContext);

  if (context === undefined) {
    throw new Error("useClientId must be used within a ClientIdProvider");
  }

  return context;
}

export default ClientIdContext;
