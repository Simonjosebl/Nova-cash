import { LegalLayout } from '../components/LegalLayout';
import { TERMS_OF_SERVICE } from '../constants/termsOfService.content';

/** Términos y Condiciones — página pública (R-05). */
export function TermsPage() {
  return <LegalLayout document={TERMS_OF_SERVICE} />;
}
