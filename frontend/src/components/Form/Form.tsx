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

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="d-flex flex-column justify-content-center text-center needs-validation"
    >
      <div className="px-3">{injectProps(children)}</div>
      <div className="mt-3 px-3 d-flex gap-2 justify-content-center">
        <Button type="submit" className="btn-primary w-100">
          {submitBtnLabel}
        </Button>
        {actionButtons}
      </div>
    </form>
  );
};

export default Form;
