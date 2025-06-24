import { describe, it, vi, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";

// Mock the requestPasswordReset API call
vi.mock("../auth/authApi", async () => {
  return {
    requestPasswordReset: vi.fn().mockResolvedValue({ message: "Mocked success" }),
  };
});

describe("ForgotPasswordModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSignInClick = vi.fn();

  it("renders with email input and Forgot Password header", () => {
    render(
      <ForgotPasswordModal open={true} onClose={mockOnClose} onSignInClick={mockOnSignInClick} />
    );

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("toggles to phone input when 'Use Phone' is clicked", () => {
    render(
      <ForgotPasswordModal open={true} onClose={mockOnClose} onSignInClick={mockOnSignInClick} />
    );

    fireEvent.click(screen.getByRole("button", { name: /use phone/i }));
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it("toggles back to email input when 'Use Email' is clicked", () => {
    render(
      <ForgotPasswordModal open={true} onClose={mockOnClose} onSignInClick={mockOnSignInClick} />
    );

    fireEvent.click(screen.getByRole("button", { name: /use phone/i }));
    fireEvent.click(screen.getByRole("button", { name: /use email/i }));
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("submits the form with email", async () => {
    const { requestPasswordReset } = await import("../auth/authApi");

    render(
      <ForgotPasswordModal open={true} onClose={mockOnClose} onSignInClick={mockOnSignInClick} />
    );

    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });

    expect(await screen.findByText(/mocked success/i)).toBeInTheDocument();
  });

  it("calls onSignInClick when 'Sign In' button is clicked", () => {
    render(
      <ForgotPasswordModal open={true} onClose={mockOnClose} onSignInClick={mockOnSignInClick} />
    );

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(mockOnSignInClick).toHaveBeenCalled();
  });
});
