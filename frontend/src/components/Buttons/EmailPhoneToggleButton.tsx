import Button from "./Button";

interface EmailPhoneToggleButtonProps {
  toggleFun: () => void;
  toggleBoolean: boolean;
}

const EmailPhoneToggleButton = ({
  toggleBoolean,
  toggleFun,
}: EmailPhoneToggleButtonProps) => {
  return (
    <Button
      className="w-100 border p-3 d-flex justify-content-center align-items-center gap-2"
      onClick={toggleFun}
    >
      {!toggleBoolean ? (
        <>
          <i className="bi bi-telephone fs-5"></i>
          <p className="m-0">Use Phone Number</p>
        </>
      ) : (
        <>
          <i className="bi bi-envelope fs-5"></i>
          <p className="m-0">Use Email Address</p>
        </>
      )}
    </Button>
  );
};

export default EmailPhoneToggleButton;
