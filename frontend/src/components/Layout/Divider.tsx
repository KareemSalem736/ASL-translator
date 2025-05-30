interface DividerProps {
  text?: string;
}

const Divider = ({ text }: DividerProps) => {
  return (
    <div className="d-flex align-items-center my-3">
      <div className="flex-grow-1">
        <hr className="m-0" />
      </div>

      {text && (
        <>
          <span className="px-2 text-muted">{text}</span>
          <div className="flex-grow-1">
            <hr className="m-0" />
          </div>
        </>
      )}
    </div>
  );
};

export default Divider;
