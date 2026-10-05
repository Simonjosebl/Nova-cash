import { LEGAL_INFO } from '@/shared/constants/legal';
import type { ILegalDocument } from '../types/legal.types';

const { responsible, contactEmail, country } = LEGAL_INFO;

/** Términos y Condiciones del Servicio (R-05). */
export const TERMS_OF_SERVICE: ILegalDocument = {
  title: 'Términos y Condiciones',
  intro: `Estos términos regulan el uso de ${responsible}. Te pedimos leerlos con atención: al crear una cuenta o ingresar con Google declaras que los aceptas.`,
  sections: [
    {
      title: '1. El servicio',
      paragraphs: [
        `${responsible} es una herramienta para organizar tus finanzas personales y compartidas: registrar ingresos y gastos, planear presupuestos y metas y colaborar con otras personas.`,
        `${responsible} no es una entidad financiera: no custodia, no transfiere ni administra dinero, y no ofrece asesoría financiera, tributaria ni legal. Los resúmenes y recomendaciones son orientativos.`,
      ],
    },
    {
      title: '2. Tu cuenta',
      paragraphs: ['Para usar el servicio debes:'],
      bullets: [
        'Ser mayor de 18 años.',
        'Proporcionar información veraz y mantenerla actualizada.',
        'Proteger tus credenciales y avisarnos si detectas un uso no autorizado de tu cuenta.',
      ],
    },
    {
      title: '3. Espacios compartidos',
      paragraphs: [
        'Puedes crear espacios e invitar a otras personas. Los miembros de un espacio pueden ver y, según su rol, modificar la información de ese espacio. Tú decides a quién invitas y eres responsable de gestionar sus accesos.',
      ],
    },
    {
      title: '4. Uso aceptable',
      paragraphs: ['Te comprometes a no:'],
      bullets: [
        'Usar el servicio para actividades ilícitas o para lavar activos.',
        'Intentar vulnerar la seguridad de la plataforma o acceder a información de otros usuarios.',
        'Suplantar a otra persona o registrar información de terceros sin su autorización.',
        'Interferir con el funcionamiento normal del servicio.',
      ],
    },
    {
      title: '5. Tu información',
      paragraphs: [
        `La información que registras es tuya. Nos otorgas una autorización limitada para almacenarla y procesarla con el único fin de prestarte el servicio, conforme a nuestra Política de Privacidad y Tratamiento de Datos.`,
      ],
    },
    {
      title: '6. Propiedad intelectual',
      paragraphs: [
        `La marca ${responsible}, su logotipo, su diseño y su software están protegidos. No puedes copiarlos, modificarlos ni distribuirlos sin autorización previa y por escrito.`,
      ],
    },
    {
      title: '7. Disponibilidad',
      paragraphs: [
        'Trabajamos para que el servicio esté disponible y funcione correctamente, pero pueden presentarse interrupciones por mantenimiento, actualizaciones o causas ajenas a nosotros. El servicio se ofrece en el estado en que se encuentra.',
      ],
    },
    {
      title: '8. Limitación de responsabilidad',
      paragraphs: [
        `Las decisiones financieras que tomes son tuyas. En la medida permitida por la ley, ${responsible} no responde por pérdidas derivadas de decisiones basadas en la información de la aplicación, de datos registrados de forma incorrecta o de interrupciones del servicio.`,
      ],
    },
    {
      title: '9. Terminación',
      paragraphs: [
        `Puedes dejar de usar el servicio y solicitar la eliminación de tu cuenta en cualquier momento escribiendo a ${contactEmail}. Podemos suspender o cancelar cuentas que incumplan estos términos.`,
      ],
    },
    {
      title: '10. Cambios',
      paragraphs: [
        'Podemos modificar estos términos. Si los cambios son sustanciales te lo informaremos dentro de la aplicación. Seguir usando el servicio después de la fecha de vigencia implica que aceptas la nueva versión.',
      ],
    },
    {
      title: '11. Ley aplicable y contacto',
      paragraphs: [
        `Estos términos se rigen por las leyes de la República de ${country}. Para cualquier inquietud escríbenos a ${contactEmail}.`,
      ],
    },
  ],
};
