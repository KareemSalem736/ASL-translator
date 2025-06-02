interface InputAlertProps {
  error?: string;
  success?: string;
}

const InputAlert = ({ error, success }: InputAlertProps) => {
  if (!error && !success) return null;

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
