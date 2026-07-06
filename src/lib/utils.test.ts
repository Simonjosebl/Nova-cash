import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combina clases', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resuelve condicionales', () => {
    const hidden = false;
    expect(cn('a', hidden && 'b', 'c')).toBe('a c');
  });

  it('resuelve conflictos de Tailwind (última gana)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
