// thie component displays an alert message based on the presence of error or success messages. Used for authentication feedback.

import { useState, useEffect } from "react";

interface AuthAlertProps {
  error?: string | null; // Error message to display, if any
  success?: string | null; // Success message to display, if any
  // Both error and success can be null or undefined, indicating no message to display
  // This allows for flexibility in showing either type of message
  // or neither at the same time
}

const AuthAlert = ({ error, success }: AuthAlertProps) => {
  const [visible, setVisible] = useState(!!(error || success));

  // Update visibility whenever error or success changes
  useEffect(() => {
    setVisible(!!(error || success));
  }, [error, success]);

  const message = error || success;
  const alertType = error ? "alert-danger" : "alert-success"; // Determine alert type based on presence of error or success message

  if (!message || !visible) return null; // Don't render if no message or not visible

  return (
    <div
      className={`my-3 alert ${alertType} d-flex justify-content-between align-items-center`}
      role="alert"
    >
      <p className="m-0">{message}</p>
      <button
        type="button"
        className="btn-close"
        onClick={() => setVisible(false)}
        aria-label="Close"
      />
    </div>
  );
};

export default AuthAlert;
