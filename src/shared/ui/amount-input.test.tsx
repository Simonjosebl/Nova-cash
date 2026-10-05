import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmountInput } from './amount-input';

function Controlled({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <AmountInput id="amount" label="Monto" value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe('AmountInput', () => {
  it('arranca vacío en 0 (sin cero fijo)', () => {
    render(<Controlled />);
    expect(screen.getByLabelText('Monto')).toHaveValue('');
  });

  it('agrupa miles mientras se escribe y entrega el número', async () => {
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText('Monto'), '1250000');
    expect(screen.getByLabelText('Monto')).toHaveValue('1.250.000');
    expect(screen.getByTestId('value')).toHaveTextContent('1250000');
  });

  it('al borrar todo vuelve a quedar vacío', async () => {
    render(<Controlled initial={500} />);
    await userEvent.clear(screen.getByLabelText('Monto'));
    expect(screen.getByLabelText('Monto')).toHaveValue('');
    expect(screen.getByTestId('value')).toHaveTextContent('0');
  });
});
