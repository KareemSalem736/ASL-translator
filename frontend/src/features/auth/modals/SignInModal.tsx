// Render the sign-in modal
// It includes a form with email/phone input, password input, and buttons for Google sign-in and toggling input mode
// It also includes links for forgot password and sign-up actions
// The form validates inputs using `validateSignIn` and displays any server-side errors or success messages

import { useEffect, useState } from "react";
import AuthAlert from "../../components/Alert/AuthAlert";
import LinkAction from "../../components/LinkActions/LinkAction";
import Divider from "../../components/Layout/Divider";
import {
  formatPhoneInput,
  normalizePhoneNumber,
} from "../../../utils/formatters/FormatPhoneNumber";
import EmailPhoneToggleButton from "../components/EmailPhoneToggleButton";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Form from "../../components/Form/Form";
import TextInput from "../../components/Form/TextInput";
import { loginUser, type AuthRequest } from "../api/authApi";
import Modal from "../../components/Modal/Modal";
import { validateSignIn } from "../validation/authValidation";

interface SignInProps {
  open: boolean;
  onClose: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
}

// Default values for the sign-in form inputs
const DEFAULT_SIGNIN_VALUES = {
  identifier: "", // This will be either email or phone based on `usePhone`
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
  const [usePhone, setUsePhone] = useState(false);
  const [initialValues, setInitialValues] = useState(DEFAULT_SIGNIN_VALUES); // Default values for the form inputs (from types/defualtvalues.d.ts)

  // Handle form submission
  // We receive `identifier` as either email or phone based on `usePhone`.
  // If `usePhone` is true, we normalize the phone number before sending.
  // If `usePhone` is false, we send the email as is.
  // The `password` is always sent as is.
  // The `loginUser` function is expected to return a success message or throw an error.
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

      const payload = { user, password } as AuthRequest;

      const result = await loginUser(payload);
      console.log("Login successful:", result); // remove later
      setSuccessMessage(result.message || "Login successful.");
      onClose();
    } catch (err: any) {
      console.error("Login failed:", err.message);
      setServerError(err.message);
    }
  };

  // Toggle between email and phone input modes
  // Resets the form to default values when toggling
  const toggleInputMode = () => {
    setInitialValues(DEFAULT_SIGNIN_VALUES);
    setUsePhone((prev) => !prev);
  };

  // Reset form values when toggling between email and phone
  useEffect(() => {
    if (!open) {
      setServerError("");
      setSuccessMessage("");
    }
  }, [open]);

  // Set initial values based on the input mode
  useEffect(() => {
    setInitialValues({
      identifier: usePhone ? "" : "", // Default to empty string for both email and phone
      password: "",
    });
  }, [usePhone]);

  if (!open) return null;

  return (
    <Modal onClose={onClose} open={open}>
      <Form
        onSubmit={handleSubmit}
        validate={(values) => validateSignIn({ ...values, usePhone })}
        initialValues={initialValues}
        submitBtnLabel="Sign In"
      >
        <p className="h1 mb-3 fw-bold text-center pb-2">Sign In</p>

        <TextInput
          name="identifier"
          label={usePhone ? "Phone Number" : "Email"}
          placeholder={usePhone ? "Phone Number" : "Email"}
          type={usePhone ? "tel" : "text"}
          autoComplete={usePhone ? "tel" : "email"}
          format={usePhone ? formatPhoneInput : undefined}
        />

        <TextInput
          name="password"
          type="password"
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
        />

        <div className="d-flex justify-content-end">
          <LinkAction text="Forgot password?" onClick={onForgotPasswordClick} />
        </div>

        <AuthAlert error={serverError} success={successMessage} />
      </Form>

      <div className="d-flex justify-content-center gap-2 my-3 px-3 text-muted">
        Don’t have an account?
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
        <EmailPhoneToggleButton
          toggleFun={toggleInputMode}
          toggleBoolean={usePhone}
        />
      </div>
    </Modal>
  );
};

export default SignIn;
