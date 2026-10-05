import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/shared/assets/logo.png';
import { ROUTES } from '@/shared/constants/routes';
import { LEGAL_INFO } from '@/shared/constants/legal';
import { ThemeSwitch } from '@/shared/ui/theme-switch';
import type { ILegalDocument } from '../types/legal.types';

const TABS: ReadonlyArray<{ to: string; label: string }> = [
  { to: ROUTES.privacy, label: 'Privacidad' },
  { to: ROUTES.terms, label: 'Términos' },
];

/**
 * Layout de documentos legales (R-05): hero de marca, pestañas entre documentos
 * y contenido legible. Páginas públicas, accesibles con o sin sesión.
 */
export function LegalLayout({ document }: { document: ILegalDocument }) {
  return (
    <div className="min-h-dvh bg-surface-tint">
      <header className="relative bg-gradient-to-br from-nova-navy via-nova-blue to-nova-cyan pb-16 pt-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6">
          <Link
            to={ROUTES.home}
            aria-label="Volver"
            className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="size-8 rounded-sm" />
            <span className="text-subtitle font-bold tracking-tight text-white">NovaCash</span>
          </div>
          <ThemeSwitch />
        </div>
      </header>

      <main className="relative mx-auto -mt-10 max-w-2xl px-4 pb-12 sm:px-6">
        <article className="flex flex-col gap-8 rounded-xl bg-card px-6 py-8 shadow-card sm:px-10 sm:py-10">
          <nav className="flex rounded-md bg-secondary p-1" aria-label="Documentos legales">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                replace
                className={({ isActive }) =>
                  cn(
                    'flex-1 rounded-sm py-2 text-center text-caption font-medium transition-all',
                    isActive ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <header className="flex flex-col gap-3">
            <h1 className="text-h2 font-bold tracking-tight text-primary">{document.title}</h1>
            <p className="text-small text-muted-foreground">
              Versión {LEGAL_INFO.version} · Vigente desde el {LEGAL_INFO.effectiveDate}
            </p>
            <p className="text-body text-muted-foreground">{document.intro}</p>
          </header>

          {document.sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-subtitle font-semibold text-foreground">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-body leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="flex flex-col gap-2 pl-5">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="list-disc text-body leading-relaxed text-muted-foreground marker:text-accent"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
