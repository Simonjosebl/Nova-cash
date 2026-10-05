import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { invitationLink, invitationShareText } from '../utils/invitationLink';

interface ShareInvitationButtonProps {
  token: string;
  workspaceName: string;
}

/**
 * Comparte el enlace de una invitación (R-11): usa el menú nativo de compartir del
 * dispositivo (WhatsApp, Telegram, correo…); si no existe, copia el enlace o abre WhatsApp.
 */
export function ShareInvitationButton({ token, workspaceName }: ShareInvitationButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const link = invitationLink(token);
    const text = invitationShareText(workspaceName, link);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Invitación a Nova Cash', text });
        return;
      } catch {
        // Si se cancela el menú nativo, se copia el enlace como alternativa.
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin portapapeles: abre WhatsApp con el mensaje listo para enviar.
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={copied ? 'Enlace copiado' : 'Compartir enlace de invitación'}
      title={copied ? 'Enlace copiado' : 'Compartir enlace'}
      onClick={() => void share()}
      className={copied ? 'text-success' : undefined}
    >
      {copied ? <Check /> : <Share2 />}
    </Button>
  );
}
