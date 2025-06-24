// Render the sign-in modal
// It includes a form with email/phone input, password input, and buttons for Google sign-in and toggling input mode
// It also includes links for forgot password and sign-up actions
// The form validates inputs using `validateSignIn` and displays any server-side errors or success messages

import { useEffect, useState } from "react";
import AuthAlert from "../components/AuthAlert";
import LinkAction from "../components/LinkAction";
import Divider from "../Divider";
import GoogleSignInButton from "./GoogleSignInButton";
import Form from "../components/Form";
import TextInput from "../components/TextInput";
import { loginUser, type AuthRequest } from "./authApi.ts";
import Modal from "../components/Modal";
import { determineLoginType, validateSignIn } from "./authValidation.ts";
import {useAuth} from "./AuthProvider.tsx";

interface SignInProps {
  open: boolean;
  onClose: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
}

// Default values for the sign-in form inputs
const DEFAULT_SIGNIN_VALUES = {
  identifier: "", // This will be either email or username
  password: "",
};

const SignIn = ({
  open,
  onClose,
  onSignupClick,
  onForgotPasswordClick,
}: SignInProps) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [initialValues] = useState(DEFAULT_SIGNIN_VALUES); // Default values for the form inputs (from types/defualtvalues.d.ts)
  const { setAuthenticated } = useAuth();

  // Handle form submission
  // We receive `identifier` as either email or username.
  // The `password` is always sent as is.
  // The `loginUser` function is expected to return a success message or throw an error.
  const handleSubmit = async ({
    identifier,
    password,
  }: typeof initialValues) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const type = determineLoginType(identifier);

      const payload = { identifier, type, password } as AuthRequest;

      const result = await loginUser(payload);
      setAuthenticated(true);
      setSuccessMessage(result.message || "Login successful.");
      onClose();
    } catch (err: any) {
      console.error("Login failed:", err.message);
      setServerError(err.message);
    }
  };

  // Set initial values based on the input mode
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
        validate={(values) => validateSignIn({ ...values })}
        initialValues={initialValues}
        submitBtnLabel="Sign In"
      >
        <p className="h1 mb-3 fw-bold text-center pb-2">Sign In</p>

        <TextInput
          name="identifier"
          label="Username or Email"
          type="text"
          autoComplete="username"
        />

        <TextInput
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
        />

        <div className="d-flex justify-content-end">
          <LinkAction text="Forgot password?" onClick={onForgotPasswordClick} />
        </div>

        <AuthAlert error={serverError} success={successMessage} />
      </Form>

      <div className="d-flex justify-content-center gap-2 mt-3 px-3 text-muted">
        <p className=" text-secondary m-0">Don’t have an account?</p>

        <div
          className="link-primary text-start"
          onClick={onSignupClick}
          style={{ cursor: "pointer" }}
        >
          Sign up
        </div>
      </div>

      <Divider text="OR" />

      <div className="d-flex flex-column px-3 gap-3">
        <GoogleSignInButton />
      </div>
    </Modal>
  );
};

export default SignIn;
