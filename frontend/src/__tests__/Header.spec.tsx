import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../features/components/Layout/Header";

describe("Header", () => {
  it("renders all buttons and fires callbacks on click", () => {
    const handleLogin = jest.fn();
    const handleProfile = jest.fn();
    const handleSettings = jest.fn();

    render(
      <Header
        onLoginClick={handleLogin}
        onProfileClick={handleProfile}
        onSettingsClick={handleSettings}
      />
    );

    // Buttons
    const loginButton = screen.getByText("LogIn");
    const profileButton = screen.getByRole("button", { name: /profile/i });
    const settingsButton = screen.getByRole("button", { name: /settings/i });
    const githubButton = screen.getByRole("link", { name: /github/i });

    // Assert they exist
    expect(loginButton).toBeInTheDocument();
    expect(profileButton).toBeInTheDocument();
    expect(settingsButton).toBeInTheDocument();
    expect(githubButton).toBeInTheDocument();

    // Click events
    fireEvent.click(loginButton);
    fireEvent.click(profileButton);
    fireEvent.click(settingsButton);

    expect(handleLogin).toHaveBeenCalledTimes(1);
    expect(handleProfile).toHaveBeenCalledTimes(1);
    expect(handleSettings).toHaveBeenCalledTimes(1);

    // GitHub button link
    expect(githubButton).toHaveAttribute(
      "href",
      "https://github.com/KareemSalem736/ASL-translator/"
    );
    expect(githubButton).toHaveAttribute("target", "_blank");
  });
});
