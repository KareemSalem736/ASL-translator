export const formatPhoneInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10); // max 10 digits
  
    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6, 10);
  
    if (cleaned.length < 4) return part1;
    if (cleaned.length < 7) return `(${part1}) ${part2}`;
    return `(${part1}) ${part2}-${part3}`;
  };
  

export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return value; // fallback if not 10 digits
};

export const normalizePhoneNumber = (formatted: string): string =>
  formatted.replace(/\D/g, "");
