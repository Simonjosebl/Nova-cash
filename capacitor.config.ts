import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor — única capa nativa (ADR-002 / ADR-056). iOS primero; Android preparado.
 */
const config: CapacitorConfig = {
  appId: 'co.novacash.app',
  appName: 'Nova Cash',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#0F172A',
      showSpinner: false,
    },
  },
};

export default config;
