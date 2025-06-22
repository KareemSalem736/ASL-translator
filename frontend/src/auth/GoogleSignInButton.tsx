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

import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { handleCredentialResponse } from "../auth/authApi";

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1) Dynamically inject GIS script if it isn’t on the page yet
    if (!window.google?.accounts) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => setReady(true);
      document.body.appendChild(s);
    } else {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    tokenClient.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (resp: { error: any; id_token: any }) => {
        if (resp.error) {
          console.error(resp);
          return;
        }
        if (resp.id_token) {
          handleCredentialResponse({ credential: resp.id_token });
        }
      },
    });
  }, [ready]);

  const handleClick = () => {
    tokenClient.current?.requestAccessToken({
      prompt: "consent",
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="border p-3 d-flex justify-content-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="100"
        height="100"
        viewBox="0 0 48 48"
        style={{
          width: "24px",
          height: "24px",
        }}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        ></path>
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        ></path>
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
      </svg>
      <p className="m-0">Continue with Google</p>
    </Button>
  );
};

export default GoogleSignInButton;
