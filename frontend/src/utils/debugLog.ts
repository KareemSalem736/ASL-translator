function isDebugEnabled(): boolean {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return false;

  const debugFromEnv = import.meta.env.VITE_DEBUG_AXIOS_LOGS === "true";
  const localFlag = localStorage.getItem("debugAxios");

  return localFlag === "true" || (localFlag === null && debugFromEnv);
}

export function debugLog(...args: any[]) {
  if (isDebugEnabled()) console.log(...args);
}

export function debugError(...args: any[]) {
  if (isDebugEnabled()) console.error(...args);
}

// Optional: expose toggle in devtools
if (typeof window !== "undefined") {
  (window as any).toggleAxiosDebug = (val: boolean) => {
    localStorage.setItem("debugAxios", val ? "true" : "false");
    console.log(`[debugLog] Axios debug logs have been ${val ? "enabled" : "disabled"}. Reloading...`);
    window.location.reload();
  };

  // Show current debug state at runtime (optional)
  console.log(`[debugLog] Debug logs are currently ${isDebugEnabled() ? "ENABLED" : "DISABLED"}`);
}
