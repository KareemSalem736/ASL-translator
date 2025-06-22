// This component defines an InstructionsPage that provides a simple guide for users of the ASL Live Translator app.
// It includes a button to navigate back to the home page and a section for instructions.

import Button from "../components/Buttons/Button";

const InstructionsPage = () => {
  return (
    <main className=" container mt-5">
      <Button className="bi bi-arrow-left btn-primary" to="/">
        {" "}
        Go back{" "}
      </Button>
      <section className="mt-5">
        <p className="display-1 fw-bold">Instructions</p>
        <p className="lead">
          A simple guide to help you get the most out of the ASL Live Translator
          app.
        </p>
        instructions here...
      </section>
    </main>
  );
};

export default InstructionsPage;
