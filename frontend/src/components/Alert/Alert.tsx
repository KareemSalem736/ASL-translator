interface AlartProps {
  error: any;
}

const Alert = ({ error }: AlartProps) => {
  return (
    <span>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </span>
  );
};

export default Alert;
