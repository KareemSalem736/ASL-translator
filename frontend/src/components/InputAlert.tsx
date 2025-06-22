// This componengt renders an alert message based on the provided error or success props. Used for input validation feedback.

interface InputAlertProps {
  error?: string;
  success?: string;
}

const InputAlert = ({ error, success }: InputAlertProps) => {
  if (!error && !success) return null; // Don't render if neither error nor success is provided

  // If both error and success are provided, prioritize error
  return (
    <div className="text-start">
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {success && !error && (
        <div className="valid-feedback d-block">{success}</div>
      )}
    </div>
  );
};

export default InputAlert;
