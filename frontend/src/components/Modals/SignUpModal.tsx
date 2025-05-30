import { useState } from "react";
import Button from "../Buttons/Button";
import Form from "../Form/Form";
import TextInput from "../Form/TextInput";
import Modal from "./Modal";
import { loginUser, registerUser } from "../../api/authApi";
import AuthAlert from "../Alert/AuthAlert";
import Divider from "../Layout/Divider";
import {
  formatPhoneInput,
  normalizePhoneNumber,
} from "../../utils/FormatPhoneNumber";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

const SignUpModal = ({ open, onClose, onSignInClick }: SignUpModalProps) => {
  const [serverError, setServerError] = useState("");
  const [usePhone, setUsePhone] = useState(false);

  const DEFAULT_SIGNIN_VALUES = {
    email: "",
    password: "",
    confirmPassword: "", // Add this
  };

  const [initialValues, setInitialValues] = useState(DEFAULT_SIGNIN_VALUES);

  const validate = (data: typeof initialValues) => {
    const errors: { [key: string]: string } = {};
    const value = data.email.trim();

    if (!value) {
      errors.email = usePhone
        ? "Phone number is required"
        : "Email is required";
    } else if (usePhone) {
      const raw = normalizePhoneNumber(value);
      if (!/^\d+$/.test(raw)) {
        errors.email = "Phone number must contain only numbers";
      } else if (raw.length !== 10) {
        errors.email = "Phone number must be exactly 10 digits";
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.email = "Invalid email format";
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

  const handleSubmit = async ({ email, password }: typeof initialValues) => {
    try {
      setServerError("");

      const payload = {
        email: usePhone ? normalizePhoneNumber(email) : email,
        password,
      };

      const result = await registerUser(payload);
      console.log("Registration successful:", result);
      onClose();
    } catch (err: any) {
      console.error("Registration failed:", err.message);
      setServerError(err.message);
    }
  };

  const toggleInputMode = () => {
    setInitialValues(DEFAULT_SIGNIN_VALUES);
    setUsePhone((prev) => !prev);
  };

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
          name="email"
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
          name="confirmPassword" // Fixed name
          type="password"
          label="Confirm Password" // Fixed label
          autoComplete="new-password"
        />

        <AuthAlert error={serverError} />
      </Form>

      <Divider text="Or continue with" />

      <div className="d-flex flex-column px-3 gap-3">
        <Button
          className="w-100 border p-3"
          onClick={() => alert("not yet implemented")}
        >
          G-mail
        </Button>

        <Button className="w-100 border p-3" onClick={toggleInputMode}>
          {usePhone ? "Use Email" : "Use Phone Number"}
        </Button>
      </div>

      <div
        className="d-flex justify-content-center gap-2 my-3 px-3 text-muted"
        onClick={onSignInClick}
        style={{ cursor: "pointer" }}
      >
        Already have an account?
        <div className="link-primary text-start">Signup</div>
      </div>
    </Modal>
  );
};

export default SignUpModal;
