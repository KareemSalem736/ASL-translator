import { useEffect, useRef } from "react";
import { handleCredentialResponse } from "../../api/authApi";
import Button from "./Button";

declare global {
  interface Window {
    google: any;
  }
}

const GoogleSignInButton = () => {
  const tokenClient = useRef<any>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Missing VITE_GOOGLE_CLIENT_ID"); // remove before production
      return;
    }

    tokenClient.current = window.google.accounts.oauth2.initTokenClient({
      client_id: "YOUR_GOOGLE_CLIENT_ID",
      scope: "openid email profile",
      callback: (tokenResponse: any) => {
        const idToken = tokenResponse.id_token;
        if (idToken) {
          handleCredentialResponse({ credential: idToken });
        }
      },
    });
  }, []);

  const handleClick = () => {
    tokenClient.current.requestAccessToken();
  };

  return (
    <Button
      onClick={handleClick}
      className="border p-3 d-flex justify-content-center gap-2"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        style={{
          width: "24px",
          height: "24px",
        }}
        className="w-5 mr-2"
      />
      <p className="m-0">Continue with Google</p>
    </Button>
  );
};

export default GoogleSignInButton;
