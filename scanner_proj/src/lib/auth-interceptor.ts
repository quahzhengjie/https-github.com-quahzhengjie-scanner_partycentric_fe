// -----------------------------------------------------------------------------
// Simple helper: call once, e.g. in app/providers.tsx, to
//   1) attach the JWT to every request (defensive if ApiClient.ts already does)
//   2) run a silent refresh a few minutes before token expiry
// -----------------------------------------------------------------------------

import { ApiClient } from "./api-client";

let _heartbeatStarted = false;

/** Attach request interceptor + start expiry check (idempotent). */
export function setupAuthInterceptor() {
  // REQUEST → inject Bearer
  ApiClient.addRequestInterceptor((cfg) => {
    const token = localStorage.getItem("authToken");
    if (!token) return cfg;

    const hdr: Record<string, string> = {
      ...(cfg.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    };
    return { ...cfg, headers: hdr };
  });

  if (!_heartbeatStarted) {
    _heartbeatStarted = true;
    startTokenExpiryHeartbeat();
  }
}

/** Poll localStorage every minute; refresh 5 min before expiry. */
export function startTokenExpiryHeartbeat() {
  setInterval(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const { exp } = JSON.parse(atob(token.split(".")[1])) as { exp: number };
    const msUntilExp = exp * 1000 - Date.now();

    if (msUntilExp < 5 * 60 * 1000) {
      // less than 5 min remaining – try silent refresh
      (async () => {
        try {
          const { accessToken, refreshToken } =
            await ApiClient.users.refreshToken(
              localStorage.getItem("refreshToken") ?? ""
            );
          localStorage.setItem("authToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        } catch {
          // refresh failed → force logout
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      })();
    }
  }, 60_000); // every 60 s
}


