import { useState } from "react";
import InputAlert from "../Alert/InputAlert";

interface TextInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  min?: string;
  max?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  format?: (val: string) => string;
  error?: string;
  autoComplete?: string;
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
  format,
  error,
  autoComplete,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="mb-3 form-floating position-relative">
      <input
        id={name}
        name={name}
        type={inputType}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={handleChange}
        className={`form-control ${error ? "is-invalid" : ""}`}
        autoComplete={autoComplete}
      />
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      {isPasswordType && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="btn position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-white"
          style={{ zIndex: 2 }}
          tabIndex={-1}
        >
          {showPassword ? (
            <i className="bi bi-eye-slash"></i>
          ) : (
            <i className="bi bi-eye"></i>
          )}
        </button>
      )}
      <InputAlert error={error} />
    </div>
  );
};

export default TextInput;
