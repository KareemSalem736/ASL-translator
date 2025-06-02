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

const SignUpModal = ({ open, onClose, onSignInClick }: SignUpModalProps) => {
  const [serverError, setServerError] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const DEFAULT_SIGNUP_VALUES = {
    identifier: "",
    password: "",
    confirmPassword: "",
  };

  const [initialValues, setInitialValues] = useState(DEFAULT_SIGNUP_VALUES);

  const validate = (data: typeof initialValues) => {
    return validateSignUp({ ...data, usePhone });
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

      const result = await registerUser(payload);
      setSuccessMessage(result.message || "Registration successful.");
    } catch (err: any) {
      console.error("Registration failed:", err.message);
      setServerError(err.message);
    }
  };

  const toggleInputMode = () => {
    setInitialValues(DEFAULT_SIGNUP_VALUES);
    setUsePhone((prev) => !prev);
  };

  useEffect(() => {
    if (!open) {
      setServerError("");
      setSuccessMessage(""); // reset when closed
    }
  }, [open]);

  return (
    <Modal onClose={onClose} open={open}>
      <Form
        onSubmit={handleSubmit}
        validate={validate}
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
