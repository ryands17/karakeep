import { createContext, useContext } from "react";

import type { ClientConfig } from "@karakeep/shared/config";

export const ClientConfigCtx = createContext<ClientConfig>({
  publicUrl: "",
  publicApiUrl: "",
  demoMode: undefined,
  auth: { disablePasswordAuth: false },
  inference: {
    isConfigured: false,
    inferredTagLang: "english",
  },
  serverVersion: undefined,
  disableNewReleaseCheck: true,
});

export function useClientConfig() {
  return useContext(ClientConfigCtx);
}
