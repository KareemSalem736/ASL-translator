interface AlartProps {
  error: any;
}

const Alart = ({ error }: AlartProps) => {
  return (
    <span>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </span>
  );
};

export default Alart;
