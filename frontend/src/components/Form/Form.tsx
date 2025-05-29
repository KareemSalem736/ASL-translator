import React, {
  useState,
  isValidElement,
  cloneElement,
  Children,
  type ReactNode,
  type ReactElement,
} from "react";
import Button from "../Buttons/Button";

interface FormProps {
  onSubmit: (data: any) => void;
  validate: (data: any) => { [key: string]: string };
  submitBtnLabel?: ReactNode;
  children: ReactNode;
  initialValues: { [key: string]: any };
  actionButtons?: ReactNode;
}

const Form = ({
  onSubmit,
  validate,
  submitBtnLabel = "Submit",
  children,
  initialValues = {},
  actionButtons,
}: FormProps) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked, multiple, selectedOptions } = e.target;

    let finalValue: any;

    if (type === "checkbox") {
      finalValue = checked;
    } else if (multiple) {
      finalValue = Array.from(
        selectedOptions as HTMLCollectionOf<HTMLOptionElement>
      ).map((option) => option.value);
    } else {
      finalValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate) {
      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return; // Prevent submit
      }
    }
    setErrors({});
    onSubmit(formData);
  };

  // 🔁 Recursive function to clone all inputs, even nested
  const injectProps = (children: ReactNode): ReactNode => {
    return Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      const element = child as ReactElement<any>;

      // If it's a form input with a name, inject value/onChange
      if (element.props.name) {
        const name = element.props.name;
        const value =
          formData[name] ?? (element.props.type === "checkbox" ? false : "");

        return cloneElement(element, {
          value: element.props.type === "checkbox" ? undefined : value,
          checked: element.props.type === "checkbox" ? value : undefined,
          onChange: handleChange,
          error: errors[name],
        });
      }

      // If it has children, recurse into them
      if (element.props.children) {
        return cloneElement(element, {
          children: injectProps(element.props.children),
        });
      }

      return element;
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex flex-column justify-content-center text-center"
    >
      <div className="px-3">{injectProps(children)}</div>
      <div className="mt-3 d-flex gap-2 justify-content-center">
        <Button type="submit" className="btn-primary w-75">
          {submitBtnLabel}
        </Button>
        {actionButtons}
      </div>
    </form>
  );
};

export default Form;
