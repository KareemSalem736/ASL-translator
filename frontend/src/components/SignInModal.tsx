import Button from "./Button";
import Modal from "./Modal";
import Form from "./Form/From";
import TextInput from "./Form/TextInput";

interface SignInProps {
  open: boolean;
  onClose: () => void;
}

const SignIn = ({ open, onClose }: SignInProps) => {
  return (
    <Modal onClose={onClose} open={open}>
      <Form
        onSubmit={function (): void {
          throw new Error("Function not implemented.");
        }}
        validate={function (): { [key: string]: string } {
          throw new Error("Function not implemented.");
        }}
        initialValues={{}}
        submitBtnLabel="Sign In"
      >
        <p className="h1 mb-3 fw-bold text-center pb-2">Sign In</p>
        <TextInput name={"email"} label={"Email"} />
        <TextInput name={"password"} type="password" label={"Password"} />
        <div
          style={{ cursor: "pointer" }}
          className="link-primary text-start"
          onClick={function (): void {
            throw new Error("Function not implemented.");
          }}
        >
          Forgot password
        </div>
      </Form>
      <div className="d-flex align-items-center my-3">
        <div className="flex-grow-1">
          <hr className="m-0" />
        </div>
        <span className="px-2 text-muted">or</span>
        <div className="flex-grow-1">
          <hr className="m-0" />
        </div>
      </div>

      <Button className="w-100 border p-3 m-2">G-mail</Button>
      <Button className="w-100 border p-3 m-2">Use Phone Number</Button>
      <div
        className="d-flex justify-content-center gap-2 my-3"
        onClick={function (): void {
          throw new Error("Function not implemented.");
        }}
        style={{ cursor: "pointer" }}
      >
        dont have an account?
        <div className="link-primary text-start">Signup</div>
      </div>
    </Modal>
  );
};

export default SignIn;
