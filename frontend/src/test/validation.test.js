import { describe, it, expect } from 'vitest';
import { validatePhone, validateAddress, validateEmail } from '../utils/validation';

describe('validation', () => {
  it('validates phone', () => {
    expect(validatePhone('+79001234567')).toBe(true);
    expect(validatePhone('abc')).toBe(false);
  });

  it('validates address', () => {
    expect(validateAddress('Moscow, Lenina street 1')).toBe(true);
    expect(validateAddress('short')).toBe(false);
  });

  it('validates email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('bad')).toBe(false);
  });
});
