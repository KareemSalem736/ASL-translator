// src/components/ForgotPasswordModal.tsx

import { useEffect, useState } from "react";
import Button from "../Buttons/Button";
import Form from "../Form/Form";
import TextInput from "../Form/TextInput";
import Modal from "./Modal";
import AuthAlert from "../Alert/AuthAlert";
import { requestPasswordReset, type USER } from "../../api/authApi";
import {
  formatPhoneInput,
  normalizePhoneNumber,
} from "../../utils/formatters/FormatPhoneNumber";
import { validateForgotPassword } from "../../utils/validation";

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
  // ─── Form state ───
  // `usePhone` determines whether the user is entering an email (false) or a phone (true)
  const [usePhone, setUsePhone] = useState(false);

  // Displays any server-side error or success message from the API
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Whenever the modal closes, reset all messages
  useEffect(() => {
    if (!open) {
      setServerError("");
      setSuccessMessage("");
      // Optionally also reset `usePhone` if you want to default back to email each time:
      setUsePhone(false);
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
      let userPayload: USER;

      if (usePhone) {
        // Normalize before sending
        const phone = normalizePhoneNumber(trimmed);
        userPayload = { phone };
      } else {
        userPayload = { email: trimmed };
      }

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

  return (
    <Modal open={open} onClose={onClose}>
      {/* Toggle between Email / Phone */}

      <Form
        onSubmit={handleSubmit}
        validate={(values) => validateForgotPassword(values, usePhone)}
        initialValues={{ identifier: "" }}
        submitBtnLabel="Send"
      >
        <p className="h1 text-center">Forgot Password</p>

        {/* Single input whose label and placeholder adapt to usePhone */}
        <TextInput
          name="identifier"
          label={usePhone ? "Phone Number" : "Email"}
          type={usePhone ? "tel" : "text"}
          placeholder={usePhone ? "Enter 10-digit phone" : "you@example.com"}
          autoComplete={usePhone ? "tel" : "email"}
          format={usePhone ? formatPhoneInput : undefined}
        />

        <AuthAlert error={serverError} success={successMessage} />

        <div className="d-flex justify-content-center mb-3">
          <Button
            className={`btn-sm me-2 ${
              !usePhone ? "btn-secondary" : "btn-outline-secondary"
            }`}
            onClick={() => setUsePhone(false)}
          >
            Use Email
          </Button>
          <Button
            className={`btn-sm ${
              usePhone ? "btn-secondary" : "btn-outline-secondary"
            }`}
            onClick={() => setUsePhone(true)}
          >
            Use Phone
          </Button>
        </div>
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
