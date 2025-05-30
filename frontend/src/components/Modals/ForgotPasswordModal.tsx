import { useEffect, useState } from "react";
import Button from "../Buttons/Button";
import Form from "../Form/Form";
import TextInput from "../Form/TextInput";
import Modal from "./Modal";
import AuthAlert from "../Alert/AuthAlert"; // Optional: To show server error
import { requestPasswordReset } from "../../api/authApi";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

const ForgotPasswordModal = ({
  open,
  onClose,
  onSignInClick,
}: ForgotPasswordModalProps) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validate = (data: { email: string }) => {
    const errors: { [key: string]: string } = {};
    const value = data.email?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(value)) {
      errors.email = "Invalid email format";
    }

    return errors;
  };

  const handleSubmit = async (data: { email: string }) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const res = await requestPasswordReset(data.email.trim());
      setSuccessMessage(res.message || "Recovery email sent.");
    } catch (err: any) {
      setServerError(
        err.response?.data?.detail || "Failed to send recovery email."
      );
    }
  };

  useEffect(() => {
    if (!open) {
      setServerError("");
      setSuccessMessage("");
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Form
        onSubmit={handleSubmit}
        validate={validate}
        initialValues={{ email: "" }}
        submitBtnLabel="Send"
      >
        <p className="h1 text-center">Forgot Password</p>

        <TextInput name="email" label="Email" autoComplete="email" />

        <AuthAlert error={serverError} success={successMessage} />
      </Form>

      <Button
        className="d-flex gap-2 m-auto mt-5 text-muted"
        onClick={onSignInClick}
      >
        <i className="bi bi-arrow-left"></i>
        <p className="p-0 m-0">Sign In</p>
      </Button>
    </Modal>
  );
};

export default ForgotPasswordModal;
