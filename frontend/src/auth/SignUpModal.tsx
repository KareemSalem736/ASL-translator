// Render the sign-up modal
// It includes a form for user registration, an alert for server messages,
// and buttons for Google sign-in and toggling between email/phone input modes.
// The form validates inputs using `validateSignUp` and submits data to the API.
// It also provides a link to the sign-in modal.
// The modal is styled with Bootstrap classes and includes a backdrop.

import { useEffect, useState } from "react";
import AuthAlert from "../components/AuthAlert";
import Divider from "../Divider";
import Form from "../components/Form";
import TextInput from "../components/TextInput";
import GoogleSignInButton from "./GoogleSignInButton";
import {type RegisterRequest, registerUser} from "./authApi.ts";
import { validateSignUp } from "./authValidation.ts";
import Modal from "../components/Modal";
import {useAuth} from "./AuthProvider.tsx";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

// Default values for the sign-up form inputs
const DEFAULT_SIGNUP_VALUES = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SignUpModal = ({
   open,
   onClose,
   onSignInClick
}: SignUpModalProps) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [initialValues] = useState(DEFAULT_SIGNUP_VALUES); // Default values for the form inputs (from types/defaultValues.d.ts)
  const { setIsAuthenticated } = useAuth();

  // Handle form submission
  // We receive `identifier` as either email or phone based on `usePhone`.
  // If `usePhone` is true, we normalize the phone number before sending.
  // If `usePhone` is false, we send the email as is.
  // The `registerUser` function is expected to return a success message or throw an error.
  const handleSubmit = async ({
    username,
    email,
    password,
  }: typeof initialValues) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const payload = { username, email, password } as RegisterRequest;

      const result = await registerUser(payload);
      setIsAuthenticated(true);
      setSuccessMessage(result.message || "Registration successful.");
      onClose();
    } catch (err: any) {
      setServerError(err.message);
    }
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
    <Modal onClose={onClose} open={open} style={{ maxWidth: "500px" }}>
      <Form
        onSubmit={handleSubmit}
        validate={(values) => validateSignUp({ ...values })}
        initialValues={initialValues}
        submitBtnLabel="Sign Up"
      >
        <p className="h1 mb-3 fw-bold text-center pb-2">Sign Up</p>

        <TextInput
          name="username"
          label="Username"
          type="text"
        />

        <TextInput
          name="email"
          label="Email"
          type="text"
        />

        <TextInput
          name="password"
          type="password"
          label="Password"
        />

        <TextInput
          name="confirmPassword"
          type="password"
          label="Confirm Password"
        />

        <AuthAlert error={serverError} success={successMessage} />
      </Form>

      <div className="d-flex justify-content-center gap-2 mt-3 px-3 text-muted">
        <p className="text-body m-0">Already have an account?</p>
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
      </div>
    </Modal>
  );
};

export default SignUpModal;
