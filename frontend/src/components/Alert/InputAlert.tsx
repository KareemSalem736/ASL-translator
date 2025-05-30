interface InputAlertProps {
  error: any;
}

const InputAlert = ({ error }: InputAlertProps) => {
  return (
    <div className="text-start">
      <div className="invalid-feedback d-block">{error}</div>
    </div>
  );
};

export default InputAlert;
