export const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  
export const isValidPhone = (phone: string): boolean =>
    /^\d{10}$/.test(phone);
  
export const isStrongPassword = (password: string): boolean =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password);
  