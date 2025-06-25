import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../Header";

describe("Header", () => {
  it("renders login and GitHub buttons, and opens login modal on click", () => {
    render(<Header  isAuthenticated={false} isLoading={false}/>);

    // Get buttons
    const loginButton = screen.getByRole("button", { name: /login/i });
    const githubButton = screen.getByRole("link", { name: /github/i });

    // Check they are present
    expect(loginButton).toBeInTheDocument();
    expect(githubButton).toBeInTheDocument();

    // GitHub link check
    expect(githubButton).toHaveAttribute(
      "href",
      "https://github.com/KareemSalem736/ASL-translator/"
    );
    expect(githubButton).toHaveAttribute("target", "_blank");

    // Open login modal
    fireEvent.click(loginButton);
    const loginModal = screen.getByRole("dialog");
    expect(loginModal).toBeInTheDocument();
  });
});
