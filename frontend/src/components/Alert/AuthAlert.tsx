import { useState, useEffect } from "react";

interface AuthAlertProps {
  error?: string | null;
}

const AuthAlert = ({ error }: AuthAlertProps) => {
  const [visible, setVisible] = useState(!!error);

  useEffect(() => {
    setVisible(!!error); // show when error updates
  }, [error]);

  if (!error || !visible) return null;

  return (
    <div
      className="my-3 alert alert-danger d-flex justify-content-between align-items-center"
      role="alert"
    >
      <p className="m-0">{error}</p>
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
