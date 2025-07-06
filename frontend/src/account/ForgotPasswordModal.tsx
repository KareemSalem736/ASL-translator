// This file defines the ForgotPasswordModal component
// which allows users to request a password reset link by entering their email or phone number.
// It includes form validation, server error handling, and success messages.

import { useEffect, useState } from "react";
import Button from "../components/Button";
import AuthAlert from "../components/AuthAlert";
import Form from "../components/Form";
import TextInput from "../components/TextInput";
import { requestPasswordReset } from "./accountApi.ts";
import Modal from "../components/Modal";
import { validateForgotPassword } from "../auth/authValidation.ts";

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
  // Displays any server-side error or success message from the API
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Whenever the modal closes, reset all messages
  useEffect(() => {
    if (!open) {
      setServerError("");
      setSuccessMessage("");
    }
  }, [open]);

  // ─── Submission handler ───
  // We receive `data` as `{ identifier: string }`.
  // If usePhone === false, send `{ user: { email } }`. Otherwise `{ user: { phone } }`.
  const handleSubmit = async (data: { identifier: string }) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const trimmed = data.identifier.trim();

      const userPayload = { email: trimmed };

      // API call: requestPasswordReset expects a USER object
      const res = await requestPasswordReset(userPayload);
      setSuccessMessage(res.message || "Recovery link sent.");
    } catch (err: any) {
      // The backend is expected to respond with `{ detail: "..." }` on error
      // If err.response?.data?.detail is undefined, we fall back to a generic message.
      setServerError(
        err.response?.data?.detail || "Failed to send recovery link."
      );
    }
  };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} style={{ maxWidth: "500px" }}>
      {/* Toggle between Email / Phone */}

      <Form
        onSubmit={handleSubmit}
        validate={(values) => validateForgotPassword(values)}
        initialValues={{ identifier: "" }}
        submitBtnLabel="Send"
      >
        <p className="h1 text-center">Forgot Password</p>

        {/* Single input whose label and placeholder adapt to usePhone */}
        <TextInput
          name="identifier"
          label="Email"
          type="text"
          autoComplete="email"
        />

        {/* Display server error or success message */}
        <AuthAlert error={serverError} success={successMessage} />
      </Form>

      <Button
        className="d-flex gap-2 m-auto mt-4 text-muted"
        onClick={onSignInClick}
      >
        <i className="bi bi-arrow-left"></i>
        <p className="p-0 m-0">Sign In</p>
      </Button>
    </Modal>
  );
};

export default ForgotPasswordModal;
