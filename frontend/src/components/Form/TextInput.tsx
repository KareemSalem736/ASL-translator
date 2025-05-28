import Alart from "../Alart";

interface TextInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;

  // Props passed from <Form />
  value?: string | number;
  min?: string;
  max?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  format?: (val: string) => string; // helps format phone number
  error?: string;
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
}: TextInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = format ? format(rawValue) : rawValue;

    // Construct a synthetic event with original name and formatted value
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

  return (
    <div className="mb-3 form-floating">
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={handleChange}
        className={`form-control ${error ? "is-invalid" : ""}`}
      />
      <label htmlFor={name} className="form-label ">
        {label}
      </label>
      <Alart error={error} />
    </div>
  );
};

export default TextInput;
