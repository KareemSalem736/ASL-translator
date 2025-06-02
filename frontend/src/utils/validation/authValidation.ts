import { normalizePhoneNumber } from "../formatters/FormatPhoneNumber";

export interface AuthSignInData {
  identifier: string;
  password: string;
  usePhone: boolean;
}

export interface AuthSignUpData extends AuthSignInData {
  confirmPassword: string;
}

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
