// This button toggles between using email and phone number for authentication.
// It displays different icons and text based on the current mode.
// When clicked, it calls the provided toggle function to switch modes.
// If toggleBoolean is false, it shows the phone icon and "Use Phone Number".
// If toggleBoolean is true, it shows the email icon and "Use Email Address".
// If the user is using phone, we normalize the phone number before sending.
// If the user is using email, we send the email as is.

import Button from "./Button";

interface EmailPhoneToggleButtonProps {
  toggleFun: () => void;
  toggleBoolean: boolean;
}

const EmailPhoneToggleButton = ({
  toggleBoolean,
  toggleFun,
}: EmailPhoneToggleButtonProps) => {
  return (
    <Button
      className="w-100 border p-3 d-flex justify-content-center align-items-center gap-2"
      onClick={toggleFun}
    >
      {!toggleBoolean ? (
        <>
          <i className="bi bi-telephone fs-5"></i>
          <p className="m-0">Use Phone Number</p>
        </>
      ) : (
        <>
          <i className="bi bi-envelope fs-5"></i>
          <p className="m-0">Use Email Address</p>
        </>
      )}
    </Button>
  );
};

export default EmailPhoneToggleButton;
