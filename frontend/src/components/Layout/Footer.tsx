// This Footer component renders a footer with two buttons: "About Us" and "How to?".
// The "About Us" button links to the "/about" page, and the "How to?" button links to the "/instructions" page.
import Button from "../Buttons/Button";

const Footer = () => {
  return (
    <div className="m-1 d-flex gap-2 justify-content-end pe-4 pt-3">
      <Button to="/about" className="py-0 border-0">
        About Us
      </Button>
      <Button className="py-0 border-0" to="/instructions">
        How to?
      </Button>
    </div>
  );
};

export default Footer;
