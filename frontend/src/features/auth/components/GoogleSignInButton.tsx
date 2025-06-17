// The button will trigger the Google sign-in flow when clicked
// It uses the Google API to request an access token
// and handles the response using the provided callback function
// Ensure you replace "YOUR_GOOGLE_CLIENT_ID" with your actual Google client ID
// and that the Google API script is loaded in your HTML file
// You can also add error handling for the token request if needed
// Note: Make sure to include the Google API script in your HTML file
// Example: <script src="https://apis.google.com/js/api.js"></script>
// Also, ensure that the Google API is initialized before this component is used
// You can also add loading states or other UI enhancements as needed

import { useEffect, useRef } from "react";
import Button from "../../components/Button/Button";
import { handleCredentialResponse } from "../api/authApi";

// Declare the global window object to include the google property
// This is necessary for TypeScript to recognize the google object
// and avoid type errors when accessing window.google.accounts.oauth2.initTokenClient
// You can also define a more specific type for google if needed
// For example, you can define the type of google.accounts.oauth2.initTokenClient
// and other methods you use from the Google API
declare global {
  interface Window {
    google: any;
  }
}

const GoogleSignInButton = () => {
  const tokenClient = useRef<any>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Ensure this is set in your .env file
    // Check if the client ID is available
    if (!clientId) {
      console.warn("Missing VITE_GOOGLE_CLIENT_ID"); // remove for production
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
