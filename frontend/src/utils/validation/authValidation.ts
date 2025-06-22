const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;

export interface AuthSignInData {
  identifier: string;
  type: string;
  password: string;
}

export interface AuthSignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const determineLoginType = (login: string) => {
  const trimmed_login = login.trim();

  if (emailRegex.test(trimmed_login)) {
    return "email";
  } else {
    return "username";
  }
}

// Validates the input for the forgot password form.
export const validateForgotPassword = (data: { identifier: string }) => {
    let errors: { [key: string]: string } = {};
    const raw = data.identifier.trim();

    if (determineLoginType(raw) === "email") {
      errors = {...errors, ...validateEmail(raw)};
    } else {
      errors = {...errors, ...validateUsername(raw)}
    }

    return errors;
  };

export const validateUsername = (username: string) => {
  const errors: Record<string, string> = {};

  if (!username) {
    errors.username = "Username is required";
  }

  if (!usernameRegex.test(username)) {
    errors.username = "Invalid characters. Please use only the following: a-zA-Z0-9_";
  }

  return errors;
}

export const validateEmail = (email: string) => {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "Email is required";
  } else {
    if (!emailRegex.test(email)) {
      errors.email = "Invalid email format";
    }
  }

  return errors;
}

export const validateSignIn = (data: AuthSignInData) => {
  let errors: Record<string, string> = {};
  const identifier = data.identifier.trim();

  if (determineLoginType(identifier) === "email") {
      errors = {...errors, ...validateEmail(identifier)};
  } else {
      errors = {...errors, ...validateUsername(identifier)};
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateSignUp = (data: AuthSignUpData) => {
  let errors: Record<string, string> = {};
  const trimmed_user = data.username.trim();
  const trimmed_email = data.email.trim();

  errors = {...errors, ...validateEmail(trimmed_email)};
  errors = {...errors, ...validateUsername(trimmed_user)};

  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
