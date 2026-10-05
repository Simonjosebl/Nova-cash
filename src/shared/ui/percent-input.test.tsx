import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PercentInput } from './percent-input';

function Controlled({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PercentInput id="pct" label="Avisar al alcanzar" value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe('PercentInput', () => {
  it('muestra el valor inicial', () => {
    render(<Controlled initial={80} />);
    expect(screen.getByLabelText('Avisar al alcanzar')).toHaveValue('80');
  });

  it('limita a 100 e ignora letras', async () => {
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText('Avisar al alcanzar'), '9a50');
    expect(screen.getByTestId('value')).toHaveTextContent('100');
  });

  it('al borrar queda vacío', async () => {
    render(<Controlled initial={80} />);
    await userEvent.clear(screen.getByLabelText('Avisar al alcanzar'));
    expect(screen.getByLabelText('Avisar al alcanzar')).toHaveValue('');
  });
});
