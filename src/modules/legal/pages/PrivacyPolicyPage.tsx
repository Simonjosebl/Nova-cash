import { LegalLayout } from '../components/LegalLayout';
import { PRIVACY_POLICY } from '../constants/privacyPolicy.content';

/** Política de Privacidad y Tratamiento de Datos — página pública (R-05). */
export function PrivacyPolicyPage() {
  return <LegalLayout document={PRIVACY_POLICY} />;
}
