import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SignInModal from "../auth/SignInModal";

// Mocks (must come before imports that use them)
vi.mock("../auth/GoogleSignInButton", () => ({
  default: () => <div data-testid="mock-google-button">Mock Google Button</div>,
}));

vi.mock("../auth/authApi", () => {
  return {
    loginUser: vi.fn().mockResolvedValue({ message: "Login successful" }),
  };
});

import { loginUser } from "../auth/authApi";

describe("SignInModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSignupClick = vi.fn();
  const mockOnForgotPasswordClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal when open", () => {
    render(
      <SignInModal
        open={true}
        onClose={mockOnClose}
        onSignupClick={mockOnSignupClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );

    expect(
      screen.getAllByText(/sign in/i)[0]
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByText(/password/i)[1]).toBeInTheDocument();
    expect(screen.getByTestId("mock-google-button")).toBeInTheDocument();
  });

  it("submits the form and closes modal on success", async () => {
    render(
      <SignInModal
        open={true}
        onClose={mockOnClose}
        onSignupClick={mockOnSignupClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs.find((el) => el.tagName === "INPUT")!;
    fireEvent.change(passwordInput, {
      target: { value: "securePass123" },
    });


    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
