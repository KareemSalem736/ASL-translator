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
