// src/__tests__/SignInModal.spec.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInModal from "../features/auth/modals/SignInModal";

// Mock external components
jest.mock("../components/Buttons/GoogleSignInButton", () => () => (
  <div data-testid="mock-google-button">Mock Google Button</div>
));

jest.mock("../api/authApi", () => ({
  loginUser: jest.fn().mockResolvedValue({ message: "Login successful" }),
}));

describe("SignInModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSignupClick = jest.fn();
  const mockOnForgotPasswordClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

    // Title
    const titleText = screen
      .getAllByText(/^sign in$/i)
      .find((el) => el.tagName.toLowerCase() === "p");

    expect(titleText).not.toBeUndefined();

    // Email and Password inputs
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs.find((el) => el.tagName === "INPUT");
    expect(passwordInput).toBeInTheDocument();

    // Google button mock
    expect(screen.getByTestId("mock-google-button")).toBeInTheDocument();
  });

  it("submits the form and closes modal on success", async () => {
    const { loginUser } = require("../api/authApi");

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

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
