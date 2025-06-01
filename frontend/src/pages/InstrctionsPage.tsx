import Button from "../components/Buttons/Button";

const InstructionsPage = () => {
  return (
    <main className="container vh-100 d-flex flex-column justify-content-center align-items-center text-center">
      <h1 className="display-1 font-monospace">Instructions</h1>
      <p className="lead ">
        A simple guide to help you get the most out of the ASL Live Translator
        app.
      </p>
      <Button className="bi bi-arrow-left btn-primary" to="/">
        {" "}
        go back{" "}
      </Button>
    </main>
  );
};

export default InstructionsPage;
