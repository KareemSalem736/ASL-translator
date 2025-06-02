import { useEffect, useState } from "react";
import Form from "../Form/Form";
import TextInput from "../Form/TextInput";
import Modal from "./Modal";
import { loginUser } from "../../api/authApi";
import AuthAlert from "../Alert/AuthAlert";
import LinkAction from "../LinkActions/LinkAction";
import Divider from "../Layout/Divider";
import {
  formatPhoneInput,
  normalizePhoneNumber,
} from "../../utils/formatters/FormatPhoneNumber";
import GoogleSignInButton from "../Buttons/GoogleSignInButton";
import EmailPhoneToggleButton from "../Buttons/EmailPhoneToggleButton";
import { validateSignIn } from "../../utils/validation";

interface SignInProps {
  open: boolean;
  onClose: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
}

const SignIn = ({
  open,
  onClose,
  onSignupClick,
  onForgotPasswordClick,
}: SignInProps) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [usePhone, setUsePhone] = useState(false);

  const DEFAULT_SIGNIN_VALUES = {
    identifier: "",
    password: "",
  };

  const [initialValues, setInitialValues] = useState(DEFAULT_SIGNIN_VALUES);

  const validate = (data: typeof initialValues) => {
    return validateSignIn({ ...data, usePhone });
  };

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

      const result = await loginUser(payload);
      console.log("Login successful:", result); // remove later
      setSuccessMessage(result.message || "Login successful.");
      onClose();
    } catch (err: any) {
      console.error("Login failed:", err.message);
      setServerError(err.message);
    }
  };

  const toggleInputMode = () => {
    setInitialValues(DEFAULT_SIGNIN_VALUES);
    setUsePhone((prev) => !prev);
  };

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
        validate={validate}
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
