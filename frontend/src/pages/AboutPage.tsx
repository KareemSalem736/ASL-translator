import Button from "../components/Buttons/Button";

const About = () => {
  return (
    <div className=" container mt-5">
      <Button className="bi bi-arrow-left fw-bold btn-primary" to="/">
        {" "}
        back
      </Button>
      <section className="m-3 mt-5">
        <h1 className="fw-bold">About</h1>

        <article className="mb-3">
          <p>
            Capstone Project on ASL transaltor web app using tenserflow/kares...
          </p>
        </article>

        <hr />

        <section className="mb-3">
          <p className="h5">Our Team</p>
          <ul className=" list-unstyled">
            <li>Team member 1</li>
            <li>Team member 2</li>
            <li>Team member 3</li>
            <li>Team member 4</li>
            <li>Team member 5</li>
          </ul>
        </section>

        <hr />

        <p className="d-flex gap-1 py-3">
          <span>Remote repo: </span>
          <a href="https://github.com/KareemSalem736/ASL-translator/">github</a>
        </p>
      </section>
    </div>
  );
};

export default About;
