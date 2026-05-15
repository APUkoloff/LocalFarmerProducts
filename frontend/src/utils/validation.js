export function validatePhone(phone) {
  return /^\+?[\d\s\-()]{7,20}$/.test(phone);
}

export function validateAddress(address) {
  return address && address.trim().length >= 10;
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
