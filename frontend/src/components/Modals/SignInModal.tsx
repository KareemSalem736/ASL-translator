import { useState } from "react";
import Button from "../Buttons/Button";
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
} from "../../utils/FormatPhoneNumber";

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
  const [usePhone, setUsePhone] = useState(false);

  const DEFAULT_SIGNIN_VALUES = {
    email: "",
    password: "",
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

    return errors;
  };

  const handleSubmit = async (formData: typeof initialValues) => {
    try {
      setServerError("");

      const payload = {
        email: usePhone ? normalizePhoneNumber(formData.email) : formData.email,
        password: formData.password,
      };

      const result = await loginUser(payload);
      console.log("Login successful:", result);
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
          name="email"
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
        onClick={onSignupClick}
        style={{ cursor: "pointer" }}
      >
        Don’t have an account?
        <div className="link-primary text-start">Sign up</div>
      </div>
    </Modal>
  );
};

export default SignIn;
