import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Design System — Nova Cash (Cap. 3).
 * Regla: nunca usar colores directos, siempre tokens.
 * Los valores semánticos (background, primary, ...) se leen de variables CSS
 * definidas en src/styles/globals.css para permitir Dark Mode a futuro (Cap. 3.24).
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // --- Tokens semánticos (shadcn/ui) ---
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        'surface-tint': 'hsl(var(--surface-tint))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // --- Paleta de marca Nova (Cap. 3.5), para usos explícitos (gradientes, etc.) ---
        nova: {
          navy: '#0F172A',
          blue: '#2563EB',
          cyan: '#06B6D4',
          green: '#22C55E',
          orange: '#F59E0B',
          red: '#EF4444',
        },
      },
      borderRadius: {
        // Cap. 3.10
        xs: '8px',
        sm: '12px',
        md: '16px', // botones
        lg: '24px', // cards
        xl: '32px', // bottom sheets
        // alias semánticos usados por shadcn (derivados de --radius)
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Escala tipográfica (Cap. 3.7)
        small: ['12px', { lineHeight: '16px' }],
        caption: ['14px', { lineHeight: '20px' }],
        body: ['16px', { lineHeight: '24px' }],
        subtitle: ['18px', { lineHeight: '28px' }],
        title: ['20px', { lineHeight: '28px' }],
        h3: ['24px', { lineHeight: '32px' }],
        h2: ['28px', { lineHeight: '36px' }],
        h1: ['32px', { lineHeight: '40px' }],
        display: ['40px', { lineHeight: '48px', fontWeight: '700' }],
      },
      boxShadow: {
        // Sombras muy sutiles (Cap. 3.11), no estilo Material
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
        sheet: '0 -4px 24px -2px rgb(15 23 42 / 0.12)',
        modal: '0 12px 40px -8px rgb(15 23 42 / 0.24)',
        // Tarjetas con halo sutil en el verde azulado de la N (contraste, R-16)
        'card-glow':
          '0 0 0 1px rgb(20 184 166 / 0.20), 0 1px 2px 0 rgb(15 23 42 / 0.05), 0 6px 16px -10px rgb(16 185 129 / 0.18)',
        'card-glow-dark':
          '0 0 0 1px rgb(20 184 166 / 0.22), 0 1px 2px 0 rgb(0 0 0 / 0.30), 0 6px 18px -12px rgb(20 184 166 / 0.20)',
        // Barra lateral elevada sobre el contenido (sombra hacia la derecha, R-06)
        panel: '10px 0 36px -14px rgb(15 23 42 / 0.22), 2px 0 8px -4px rgb(15 23 42 / 0.10)',
        'panel-dark': '12px 0 40px -12px rgb(0 0 0 / 0.65), 2px 0 10px -4px rgb(0 0 0 / 0.45)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
