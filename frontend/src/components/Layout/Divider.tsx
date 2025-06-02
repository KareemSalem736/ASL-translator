interface DividerProps {
  text?: string;
}

const Divider = ({ text }: DividerProps) => {
  return (
    <div className="px-3 pb-4 pt-3">
      <div className="d-flex align-items-center my-3">
        <div className="flex-grow-1">
          <hr className="m-0" />
        </div>

        {text && (
          <>
            <span className="px-2 fw-bold" style={{ fontSize: "15px" }}>
              {text}
            </span>
            <div className="flex-grow-1">
              <hr className="m-0" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Divider;
