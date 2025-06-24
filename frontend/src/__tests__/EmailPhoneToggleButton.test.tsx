import { render, screen, fireEvent } from "@testing-library/react";
import EmailPhoneToggleButton from "../auth/EmailPhoneToggleButton";

describe("EmailPhoneToggleButton", () => {
  it("displays 'Use Phone Number' when toggleBoolean is false", () => {
    render(<EmailPhoneToggleButton toggleBoolean={false} toggleFun={() => {}} />);
    expect(screen.getByText(/use phone number/i)).toBeInTheDocument();
    expect(screen.queryByText(/use email address/i)).not.toBeInTheDocument();
  });

  it("displays 'Use Email Address' when toggleBoolean is true", () => {
    render(<EmailPhoneToggleButton toggleBoolean={true} toggleFun={() => {}} />);
    expect(screen.getByText(/use email address/i)).toBeInTheDocument();
    expect(screen.queryByText(/use phone number/i)).not.toBeInTheDocument();
  });

  it("calls the toggle function when clicked", () => {
    const mockToggle = vi.fn();
    render(<EmailPhoneToggleButton toggleBoolean={false} toggleFun={mockToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
