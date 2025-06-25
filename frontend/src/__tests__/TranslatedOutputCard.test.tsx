import { render, screen, fireEvent } from "@testing-library/react";
import TranslatedOutputCard from "../prediction/TranslatedOutputCard"; 
import { describe, it, expect, vi } from "vitest";

describe("TranslatedOutputCard", () => {
  const initialText = "Translated sentence here.";

  it("renders the card label and translated output", () => {
    render(
      <TranslatedOutputCard
        translatedText={initialText}
        setTranslatedText={vi.fn()}
      />
    );

    expect(screen.getByText(/translated output/i)).toBeInTheDocument();
    expect(screen.getByText(initialText)).toBeInTheDocument();
  });

  it("renders Undo, Clear, and Copy buttons with correct tooltips", async () => {
    render(
      <TranslatedOutputCard
        translatedText={initialText}
        setTranslatedText={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/undo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/clear/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/copy/i)).toBeInTheDocument();
  });

  it("clears the translated text when Clear button is clicked", () => {
    const setTranslatedText = vi.fn();
    render(
      <TranslatedOutputCard
        translatedText={initialText}
        setTranslatedText={setTranslatedText}
      />
    );

    const clearButton = screen.getByLabelText(/clear/i);
    fireEvent.click(clearButton);

    expect(setTranslatedText).toHaveBeenCalledWith("");
  });

  it("copies the translated text to clipboard when Copy button is clicked", async () => {
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(
      <TranslatedOutputCard
        translatedText={initialText}
        setTranslatedText={vi.fn()}
      />
    );

    const copyButton = screen.getByLabelText(/copy/i);
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(initialText);
  });

  it("renders null content message when no translated text is present", () => {
    render(
      <TranslatedOutputCard translatedText={""} setTranslatedText={vi.fn()} />
    );

    expect(screen.getByText(/no predictions yet/i)).toBeInTheDocument();
  });
});
