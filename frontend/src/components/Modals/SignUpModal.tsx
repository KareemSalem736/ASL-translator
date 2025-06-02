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
} from "../../utils/FormatPhoneNumber";
import GoogleSignInButton from "../Buttons/GoogleSignInButton";
import UsePhoneButton from "../Buttons/EmailPhoneToggleButton";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

const SignUpModal = ({ open, onClose, onSignInClick }: SignUpModalProps) => {
  const [serverError, setServerError] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const DEFAULT_SIGNIN_VALUES = {
    identifier: "",
    password: "",
    confirmPassword: "",
  };

  const [initialValues, setInitialValues] = useState(DEFAULT_SIGNIN_VALUES);

  const validate = (data: typeof initialValues) => {
    const errors: { [key: string]: string } = {};
    const value = data.identifier.trim();

    if (!value) {
      errors.identifier = usePhone
        ? "Phone number is required"
        : "Email is required";
    } else if (usePhone) {
      const raw = normalizePhoneNumber(value);
      if (!/^\d+$/.test(raw)) {
        errors.identifier = "Phone number must contain only numbers";
      } else if (raw.length !== 10) {
        errors.identifier = "Phone number must be exactly 10 digits";
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.identifier = "Invalid email format";
      }
    }

    if (!data.password) {
      errors.password = "Password is required";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
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
    setInitialValues(DEFAULT_SIGNIN_VALUES);
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
