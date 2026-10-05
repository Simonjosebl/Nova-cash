import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useThemeStore } from '@/shared/stores/theme.store';
import { ThemeSwitch } from './theme-switch';

describe('ThemeSwitch', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('refleja el tema actual', () => {
    render(<ThemeSwitch />);
    expect(screen.getByRole('switch', { name: 'Modo oscuro' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('alterna entre claro y oscuro', async () => {
    render(<ThemeSwitch />);
    const toggle = screen.getByRole('switch', { name: 'Modo oscuro' });

    await userEvent.click(toggle);
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(toggle);
    expect(useThemeStore.getState().theme).toBe('light');
  });
});
