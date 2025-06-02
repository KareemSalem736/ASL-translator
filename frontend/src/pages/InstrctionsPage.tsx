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
        instrctions here...
      </section>
    </main>
  );
};

export default InstructionsPage;
