import { describe, it, expect, beforeEach } from 'vitest';
import { loadCart, saveCart, clearCart } from '../utils/storage';

describe('cart storage', () => {
  beforeEach(() => {
    clearCart();
  });

  it('saves and loads cart items', () => {
    const items = [{ productId: 1, quantity: 2 }];
    saveCart(items);
    expect(loadCart()).toEqual(items);
  });

  it('returns empty array when no cart', () => {
    expect(loadCart()).toEqual([]);
  });
});
