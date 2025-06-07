// Render the sign-up modal
// It includes a form for user registration, an alert for server messages,
// and buttons for Google sign-in and toggling between email/phone input modes.
// The form validates inputs using `validateSignUp` and submits data to the API.
// It also provides a link to the sign-in modal.
// The modal is styled with Bootstrap classes and includes a backdrop.

import { useEffect, useState } from "react";
import Form from "../Form/Form";
import TextInput from "../Form/TextInput";
import Modal from "./Modal";
import { registerUser } from "../../api/authApi";
import AuthAlert from "../Alert/AuthAlert";
import Divider from "../Layout/Divider";
import {
  formatPhoneInput,
  normalizePhoneNumber,
} from "../../utils/formatters/FormatPhoneNumber";
import GoogleSignInButton from "../Buttons/GoogleSignInButton";
import UsePhoneButton from "../Buttons/EmailPhoneToggleButton";
import { validateSignUp } from "../../utils/validation";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

// Default values for the sign-up form inputs
const DEFAULT_SIGNUP_VALUES = {
  identifier: "",
  password: "",
  confirmPassword: "",
};

const SignUpModal = ({ open, onClose, onSignInClick }: SignUpModalProps) => {
  const [serverError, setServerError] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [initialValues, setInitialValues] = useState(DEFAULT_SIGNUP_VALUES); // Default values for the form inputs (from types/defaultValues.d.ts)

  // Handle form submission
  // We receive `identifier` as either email or phone based on `usePhone`.
  // If `usePhone` is true, we normalize the phone number before sending.
  // If `usePhone` is false, we send the email as is.
  // The `registerUser` function is expected to return a success message or throw an error.
  const handleSubmit = async ({
    identifier,
    password,
  }: typeof initialValues) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const user = usePhone
        ? { phone: normalizePhoneNumber(identifier) }
        : { email: identifier };

      const payload = { user, password };

      const result = await registerUser(payload);
      setSuccessMessage(result.message || "Registration successful.");
    } catch (err: any) {
      console.error("Registration failed:", err.message);
      setServerError(err.message);
    }
  };

  // Toggle between email and phone input modes
  const toggleInputMode = () => {
    setInitialValues(DEFAULT_SIGNUP_VALUES);
    setUsePhone((prev) => !prev);
  };

  // Reset server error and success message when the modal closes
  // This ensures that messages do not persist when the modal is reopened
  // Also reset the initial values to default
  useEffect(() => {
    if (!open) {
      setServerError("");
      setSuccessMessage("");
    }
  }, [open]);

  return (
    <Modal onClose={onClose} open={open}>
      <Form
        onSubmit={handleSubmit}
        validate={(values) => validateSignUp({ ...values, usePhone })}
        initialValues={initialValues}
        submitBtnLabel="Sign Up"
      >
        <p className="h1 mb-3 fw-bold text-center pb-2">Sign Up</p>

        <TextInput
          name="identifier"
          label={usePhone ? "Phone Number" : "Email"}
          type={usePhone ? "tel" : "text"}
          autoComplete={usePhone ? "tel" : "email"}
          format={usePhone ? formatPhoneInput : undefined}
        />

        <TextInput
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
        />

        <TextInput
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
        />

        <AuthAlert error={serverError} success={successMessage} />
      </Form>

      <div className="d-flex justify-content-center gap-2 my-3 px-3 text-muted">
        Already have an account?
        <div
          className="link-primary text-start"
          onClick={onSignInClick}
          style={{ cursor: "pointer" }}
        >
          Sign in
        </div>
      </div>

      <Divider text="OR" />

      <div className="d-flex flex-column px-3 gap-3">
        <GoogleSignInButton />
        <UsePhoneButton toggleFun={toggleInputMode} toggleBoolean={usePhone} />
      </div>
    </Modal>
  );
};

export default SignUpModal;
