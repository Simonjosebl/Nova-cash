import { describe, expect, it } from 'vitest';
import { PRIVACY_POLICY } from '../constants/privacyPolicy.content';
import { TERMS_OF_SERVICE } from '../constants/termsOfService.content';

describe('documentos legales', () => {
  it.each([PRIVACY_POLICY, TERMS_OF_SERVICE])('$title tiene secciones con contenido', (doc) => {
    expect(doc.sections.length).toBeGreaterThan(0);
    for (const section of doc.sections) {
      expect(section.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it('la política incluye la declaración de Uso Limitado de Google', () => {
    const text = PRIVACY_POLICY.sections.flatMap((s) => s.paragraphs).join(' ');
    expect(text).toContain('requisitos de Uso Limitado');
  });

  it('la política cubre los derechos del titular (Ley 1581)', () => {
    expect(PRIVACY_POLICY.sections.some((s) => s.title.includes('derechos'))).toBe(true);
  });
});
