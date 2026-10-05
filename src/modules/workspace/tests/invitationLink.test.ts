import { describe, expect, it } from 'vitest';
import { invitationLink, invitationShareText } from '../utils/invitationLink';

describe('invitationLink', () => {
  it('arma el enlace de aceptación con el token', () => {
    expect(invitationLink('abc-123', 'https://app.novacash.co')).toBe(
      'https://app.novacash.co/invite/abc-123',
    );
  });

  it('incluye el espacio y el enlace en el mensaje', () => {
    const text = invitationShareText('Hogar', 'https://x/invite/t');
    expect(text).toContain('"Hogar"');
    expect(text).toContain('https://x/invite/t');
  });
});
