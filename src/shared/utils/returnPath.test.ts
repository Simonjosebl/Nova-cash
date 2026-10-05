import { beforeEach, describe, expect, it } from 'vitest';
import { consumeReturnPath, saveReturnPath } from './returnPath';

describe('returnPath', () => {
  beforeEach(() => sessionStorage.clear());

  it('devuelve la ruta guardada una sola vez', () => {
    saveReturnPath('/invite/abc');
    expect(consumeReturnPath()).toBe('/invite/abc');
    expect(consumeReturnPath()).toBeNull();
  });

  it('ignora rutas externas', () => {
    saveReturnPath('//evil.com');
    expect(consumeReturnPath()).toBeNull();
  });
});
