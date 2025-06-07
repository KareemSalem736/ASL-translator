// This component renders a form with validation and submission handling
// It uses the provided `onSubmit` function to handle form submission
// It also injects validation errors and success messages into the form fields
// The form fields are passed as children, allowing for flexible form structures
// The form also supports additional action buttons like "Reset", "Cancel", etc.

import React, {
  useState,
  useEffect,
  isValidElement,
  cloneElement,
  Children,
  type ReactNode,
  type ReactElement,
} from "react";
import Button from "../Buttons/Button";

interface FormProps {
  onSubmit: (data: any) => void; // Function to handle form submission, receives form data as an argument
  validate: (data: any) => { [key: string]: string }; // Validation function that returns an object with field names as keys and error messages as value
  submitBtnLabel?: ReactNode; // Label for the submit button, can be a string or JSX
  children: ReactNode; // Form fields and other elements
  initialValues: { [key: string]: any }; // Initial values for the form fields
  actionButtons?: ReactNode; // Additional buttons like "Reset", "Cancel", etc.
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

  // Initialize formData with initialValues
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

    const newFormData = {
      ...formData,
      [name]: finalValue,
    };

    setFormData(newFormData);

    // Re-validate only the changed field
    const newErrors = validate(newFormData);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: newErrors[name] ?? "",
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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
          successMessage:
            !errors[name] && formData[name] ? "Looks good!" : undefined,
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

  // Initialize formData with initialValues on mount
  // This ensures that the form is reset to initial values when they change
  // This is useful for cases like editing a profile where initialValues might change
  // or when the form is reused with different initial values
  // This effect runs only once when the component mounts or when initialValues change
  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  return (
    <form
      noValidate // Prevent default HTML5 validation
      onSubmit={handleSubmit}
      className="d-flex flex-column justify-content-center text-center needs-validation"
    >
      <div className="px-3">{injectProps(children)}</div>
      <div className="mt-3 px-3 d-flex gap-2 justify-content-center">
        <Button type="submit" className="btn-primary w-100">
          {/* Use the label passed in props or default to "Submit" */}
          {submitBtnLabel}
        </Button>
        {/* Render any additional action buttons passed in props */}
        {/* This allows for flexibility in adding buttons like "Reset", "Cancel", etc. */}
        {actionButtons}
      </div>
    </form>
  );
};

export default Form;
