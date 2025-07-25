// This inputfiled component is a reusable text input field that supports various features such as formatting, validation, and password visibility toggling.
// It can be used in forms to collect user input with optional formatting and validation messages.

import { useState } from "react";
import InputAlert from "./InputAlert";

interface TextInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  min?: string;
  max?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  format?: (val: string) => string;

  // validation
  error?: string;
  successMessage?: string;
}

const TextInput = ({
  name,
  label,
  type = "text",
  placeholder = " ",
  min = "",
  max = "",
  value,
  onChange,
  autoComplete,
  format,
  error,
  successMessage,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // Handle change event and apply formatting if provided
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = format ? format(rawValue) : rawValue;

    const event = {
      ...e,
      target: {
        ...e.target,
        name,
        value: formattedValue,
      },
    };

    if (onChange) onChange(event as React.ChangeEvent<any>);
  };

  const isPasswordType = type === "password";
  const inputType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="mb-3 position-relative">
      <div className="form-floating">
        <input
          id={name}
          name={name} // Use name for form submission
          aria-label={label}
          autoFocus={false}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          tabIndex={0}
          // Use the inputType variable to set the type dynamically
          type={inputType}
          min={min}
          max={max}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={handleChange}
          className={`form-control pe-5 ${
            error ? "is-invalid" : successMessage ? "is-valid" : ""
          }`}
          autoComplete={autoComplete}
        />
        <label htmlFor={name} className="form-label">
          {label}
        </label>

        {/* Show password toggle button only for password inputs */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="btn position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-white"
            style={{ zIndex: 2 }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <i className="bi bi-eye-slash"></i>
            ) : (
              <i className="bi bi-eye"></i>
            )}
          </button>
        )}
      </div>

      {/* Error shown below input, not inside floating div */}
      <InputAlert error={error} success={successMessage} />
    </div>
  );
};

export default TextInput;
