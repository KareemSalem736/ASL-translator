interface InputAlertProps {
  error: any;
}

const InputAlert = ({ error }: InputAlertProps) => {
  return (
    <span className="text-start">
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </span>
  );
};

export default InputAlert;
