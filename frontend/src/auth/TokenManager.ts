import {clearAuthData, refreshAccessToken} from "./authApi.ts";
import {jwtDecode} from "jwt-decode";

let sessionId: number | null = null;

/**
 * Create a timer for proactively refreshing access token before expiration.
 */
export const startTokenTimer = (token: string) => {
    // Stop the timer if there is already one running.
    stopTokenTimer();
    try {
        const expirationTime = jwtDecode(token).exp;
        const currentTime = Date.now();

        if(!expirationTime) {
            console.error("No valid expiration found after token decoding.");
            return;
        }

        const expirationTimeMs = 1000 * expirationTime;

        // Set the token refresh to run 30 seconds before the token would expire.
        let timeout = expirationTimeMs - currentTime - 30000;

        // Make sure that the timeout isn't negative.
        if (timeout < 0) {
            timeout = 0;
        }

        console.log(`Starting timer to refresh access token in ${Math.round(timeout / 1000)} seconds.`);
        sessionId = window.setTimeout(async () => {
            try {
                await refreshAccessToken();
            } catch (error) {
                // If there was an error, it's likely the user's session has expired
                // and will need to relog.
                clearAuthData();
            }
        }, timeout);
    } catch (error) {
        // Clear the auth data when JWT decoding fails.
        clearAuthData();
    }
};

/**
 * Stop any active token timer and nullify the sessionId.
 */
export const stopTokenTimer = () => {
    if (sessionId) {
        clearTimeout(sessionId);
        sessionId = null;
    }
};