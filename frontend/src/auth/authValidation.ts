import { normalizePhoneNumber } from "../utils/FormatPhoneNumber";


export interface AuthSignInData {
  identifier: string;
  password: string;
  usePhone: boolean;
}

export interface AuthSignUpData extends AuthSignInData {
  confirmPassword: string;
}

// Validates the input for the forgot password form.
export const validateForgotPassword    = (data: { identifier: string }, usePhone: boolean) => {
    const errors: { [key: string]: string } = {};
    const raw = data.identifier.trim();

    if (!raw) {
      errors.identifier = usePhone
        ? "Phone number is required"
        : "Email is required";
    } else if (usePhone) {
      // Normalize and then ensure it’s digits-only & length exactly 10
      const normalized = normalizePhoneNumber(raw);
      if (!/^\d+$/.test(normalized)) {
        errors.identifier = "Phone number must contain only digits";
      } else if (normalized.length !== 10) {
        errors.identifier = "Phone number must be exactly 10 digits";
      }
    } else {
      // Validate as email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(raw)) {
        errors.identifier = "Invalid email format";
      }
    }

    return errors;
  };

export const validateSignIn = (data: AuthSignInData) => {
  const errors: Record<string, string> = {};
  const value = data.identifier.trim();

  if (!value) {
    errors.identifier = data.usePhone
      ? "Phone number is required"
      : "Email is required";
  } else if (data.usePhone) {
    const raw = normalizePhoneNumber(value);
    if (!/^\d+$/.test(raw)) {
      errors.identifier = "Phone number must contain only numbers";
    } else if (raw.length !== 10) {
      errors.identifier = "Phone number must be exactly 10 digits";
    }
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.identifier = "Invalid email format";
    }
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateSignUp = (data: AuthSignUpData) => {
  const errors = validateSignIn(data);

  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
