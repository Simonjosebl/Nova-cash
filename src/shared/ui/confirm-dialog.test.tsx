import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  const setup = () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="¿Eliminar esta meta?"
        description="No podrás deshacerlo."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    return { onConfirm, onCancel };
  };

  it('muestra título y descripción', () => {
    setup();
    expect(screen.getByRole('alertdialog', { name: '¿Eliminar esta meta?' })).toBeInTheDocument();
    expect(screen.getByText('No podrás deshacerlo.')).toBeInTheDocument();
  });

  it('confirma con el botón principal', async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('cancela con Escape', async () => {
    const { onCancel } = setup();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });
});
