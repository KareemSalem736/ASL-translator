import { useState, useEffect } from "react";

interface AuthAlertProps {
  error?: string | null;
  success?: string | null;
}

const AuthAlert = ({ error, success }: AuthAlertProps) => {
  const [visible, setVisible] = useState(!!(error || success));

  useEffect(() => {
    setVisible(!!(error || success));
  }, [error, success]);

  const message = error || success;
  const alertType = error ? "alert-danger" : "alert-success";

  if (!message || !visible) return null;

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
