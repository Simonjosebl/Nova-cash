import { LEGAL_INFO } from '@/shared/constants/legal';
import type { ILegalDocument } from '../types/legal.types';

const { responsible, contactEmail, country } = LEGAL_INFO;

/** Política de Privacidad y Tratamiento de Datos Personales (Ley 1581 de 2012 — R-05). */
export const PRIVACY_POLICY: ILegalDocument = {
  title: 'Política de Privacidad y Tratamiento de Datos',
  intro: `En ${responsible} cuidamos tu información. Esta política explica qué datos recopilamos, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus derechos como titular.`,
  sections: [
    {
      title: '1. Responsable del tratamiento',
      paragraphs: [
        `${responsible} es responsable del tratamiento de tus datos personales. Puedes contactarnos en ${contactEmail} para cualquier asunto relacionado con esta política.`,
      ],
    },
    {
      title: '2. Marco legal',
      paragraphs: [
        `Tratamos tus datos conforme a la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas de protección de datos personales de ${country}.`,
      ],
    },
    {
      title: '3. Datos que recopilamos',
      paragraphs: ['Solo recopilamos la información necesaria para prestarte el servicio:'],
      bullets: [
        'Datos de identificación y contacto: nombre y correo electrónico.',
        'Datos de tu cuenta de Google, si eliges ingresar con Google: nombre, correo electrónico y foto de perfil.',
        'Información financiera que tú registras: cuentas, movimientos, categorías, presupuestos, metas y eventos de calendario.',
        'Datos de colaboración: los espacios que creas, sus miembros e invitaciones.',
        'Datos técnicos y de seguridad: registros de auditoría, fechas de acceso y tipo de dispositivo o navegador.',
      ],
    },
    {
      title: '4. Datos que no recopilamos',
      paragraphs: [
        'No nos conectamos con tu banco, no solicitamos claves bancarias ni números completos de tarjetas y no tratamos datos sensibles. Nova Cash no mueve ni custodia dinero.',
      ],
    },
    {
      title: '5. Finalidades del tratamiento',
      paragraphs: ['Usamos tus datos para:'],
      bullets: [
        'Crear, autenticar y administrar tu cuenta.',
        'Prestar el servicio: registrar tus finanzas y mostrarte resúmenes, reportes y recomendaciones.',
        'Permitir la colaboración con las personas que invitas a tus espacios.',
        'Enviarte notificaciones propias del servicio, como recordatorios de pagos o invitaciones.',
        'Proteger la seguridad de la plataforma, prevenir fraudes y mantener registros de auditoría.',
        'Atender tus consultas, reclamos y solicitudes.',
        'Cumplir obligaciones legales.',
      ],
    },
    {
      title: '6. Uso de la información de Google',
      paragraphs: [
        'Si ingresas con Google, solo recibimos tu nombre, tu correo electrónico y tu foto de perfil. Los usamos exclusivamente para identificarte, crear tu cuenta y mostrar tu perfil dentro de la aplicación.',
        'El uso y la transferencia a cualquier otra aplicación de la información recibida de las API de Google cumplen la Política de Datos de Usuario de los Servicios de API de Google, incluidos los requisitos de Uso Limitado.',
        'No vendemos esta información, no la usamos para publicidad y no la compartimos con terceros, salvo cuando sea necesario para prestar el servicio, por razones de seguridad o por obligación legal.',
      ],
    },
    {
      title: '7. Con quién compartimos tus datos',
      paragraphs: ['Nunca vendemos tus datos personales. Solo los compartimos con:'],
      bullets: [
        'Proveedores de infraestructura que actúan como encargados del tratamiento, como nuestro proveedor de base de datos y autenticación (Supabase).',
        'Google, como proveedor de identidad, cuando eliges ingresar con tu cuenta de Google.',
        'Los miembros de los espacios compartidos que tú creas o a los que te unes, según su rol.',
        'Autoridades competentes, cuando una norma o una orden judicial lo exija.',
      ],
    },
    {
      title: '8. Transferencia internacional',
      paragraphs: [
        `Nuestros proveedores pueden almacenar los datos en servidores ubicados fuera de ${country}. En esos casos exigimos niveles adecuados de protección, conforme a la normativa aplicable.`,
      ],
    },
    {
      title: '9. Seguridad',
      paragraphs: [
        'Protegemos tu información con cifrado en tránsito (HTTPS), control de acceso por usuario en la base de datos, aislamiento de cada espacio de trabajo y registros de auditoría. Ningún sistema es infalible, pero trabajamos de forma continua para mantener tus datos seguros.',
      ],
    },
    {
      title: '10. Conservación',
      paragraphs: [
        'Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu cuenta, suprimiremos o anonimizaremos tu información en un plazo razonable, salvo aquella que debamos conservar por obligación legal.',
      ],
    },
    {
      title: '11. Tus derechos como titular',
      paragraphs: ['Como titular de los datos tienes derecho a:'],
      bullets: [
        'Conocer, actualizar y rectificar tus datos personales.',
        'Solicitar prueba de la autorización que nos otorgaste.',
        'Ser informado sobre el uso que damos a tus datos.',
        'Presentar quejas ante la Superintendencia de Industria y Comercio.',
        'Revocar la autorización y solicitar la supresión de tus datos.',
        'Acceder gratuitamente a tus datos personales.',
      ],
    },
    {
      title: '12. Cómo ejercer tus derechos',
      paragraphs: [
        `Escríbenos a ${contactEmail} indicando tu nombre, el correo de tu cuenta y tu solicitud. Atenderemos las consultas en un máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles, según la Ley 1581 de 2012.`,
      ],
    },
    {
      title: '13. Menores de edad',
      paragraphs: [
        'Nova Cash está dirigido a personas mayores de 18 años. No recopilamos conscientemente datos de menores de edad.',
      ],
    },
    {
      title: '14. Cambios a esta política',
      paragraphs: [
        'Podemos actualizar esta política. Cuando haya cambios sustanciales te lo informaremos dentro de la aplicación antes de que entren en vigor.',
      ],
    },
  ],
};
