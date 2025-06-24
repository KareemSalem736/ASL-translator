import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpModal from "../auth/SignUpModal";
import { vi } from "vitest";

// Mock dependencies
vi.mock("../auth/authApi", () => ({
  registerUser: vi.fn().mockResolvedValue({ message: "Registration successful." }),
}));

import { registerUser } from "../auth/authApi";

describe("SignUpModal", () => {
  const onClose = vi.fn();
  const onSignInClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with all form fields and default mode (email)", () => {
    render(<SignUpModal open={true} onClose={onClose} onSignInClick={onSignInClick} />);

    expect(screen.getAllByText(/sign up/i)[1]).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[1]).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("toggles to phone input when toggle button is clicked", () => {
    render(<SignUpModal open={true} onClose={onClose} onSignInClick={onSignInClick} />);

    const toggleButton = screen.getByRole("button", { name: /use phone number/i });
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it("submits form and displays success message", async () => {
    render(<SignUpModal open={true} onClose={onClose} onSignInClick={onSignInClick} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Secure123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Secure123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        user: { email: "test@example.com" },
        password: "Secure123",
      });

      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it("clicking sign in link triggers onSignInClick", () => {
    render(<SignUpModal open={true} onClose={onClose} onSignInClick={onSignInClick} />);

    const signInLink = screen.getByText(/sign in/i);
    fireEvent.click(signInLink);

    expect(onSignInClick).toHaveBeenCalled();
  });
});