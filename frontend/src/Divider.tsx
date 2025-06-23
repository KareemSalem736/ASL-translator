// This component renders a horizontal divider with an optional text label in the middle.
// The divider is styled with Bootstrap classes and includes padding for spacing.

interface DividerProps {
  text?: string;
}

const Divider = ({ text }: DividerProps) => {
  return (
    <div className="p-3">
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
