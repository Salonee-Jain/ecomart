export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: "Phone number must be at least 10 digits" };
  }
  
  return { isValid: true };
};

export const validateZipCode = (zipCode: string, country: string = "AUS"): ValidationResult => {
  if (!zipCode) {
    return { isValid: false, error: "Zip code is required" };
  }
  
  // Australian postcode: 4 digits
  if (country === "AUS") {
    const ausRegex = /^\d{4}$/;
    if (!ausRegex.test(zipCode)) {
      return { isValid: false, error: "Australian postcode must be 4 digits" };
    }
  }
  
  // US zip code: 5 digits or 5+4 format
  if (country === "USA") {
    const usRegex = /^\d{5}(-\d{4})?$/;
    if (!usRegex.test(zipCode)) {
      return { isValid: false, error: "US zip code must be 5 digits (or 5+4 format)" };
    }
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }
  
  return { isValid: true };
};

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  return { isValid: true };
};

export const validateName = (name: string, fieldName: string = "Name"): ValidationResult => {
  if (!name || name.trim() === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  return { isValid: true };
};

export const validateQuantity = (quantity: number, max?: number): ValidationResult => {
  if (quantity < 1) {
    return { isValid: false, error: "Quantity must be at least 1" };
  }
  
  if (max && quantity > max) {
    return { isValid: false, error: `Only ${max} items available in stock` };
  }
  
  return { isValid: true };
};
