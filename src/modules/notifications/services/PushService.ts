/**
 * PushService — abstracción de notificaciones push/locales (Cap. 4.20 / 2.7).
 *
 * El push real usa los plugins nativos de Capacitor (@capacitor/push-notifications y
 * @capacitor/local-notifications) sobre iOS con APNs (Cap. 11.11), que requieren el
 * proyecto nativo y certificados de Apple. Esta capa aísla esa dependencia: la app
 * funciona en web con push deshabilitado y se conecta al plugin al compilar para iOS.
 */
export type PushStatus = 'unsupported' | 'denied' | 'granted';

export interface IPushService {
  isSupported(): boolean;
  register(): Promise<PushStatus>;
}

/** Implementación web/no-nativa: push no disponible (se habilita en iOS). */
export class WebPushService implements IPushService {
  isSupported(): boolean {
    return false;
  }

  async register(): Promise<PushStatus> {
    return 'unsupported';
  }
}

export const pushService: IPushService = new WebPushService();
