import { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

/**
 * Botão "Entrar com Google" — o oficial, do Google Identity Services,
 * carregado direto do Google como o captcha da Cloudflare.
 *
 * O botão só entrega um ID token (`credential`): quem confere e decide é a API
 * (`POST /auth/google`). Sem `VITE_GOOGLE_CLIENT_ID` não renderiza nada.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  string | undefined;

type RespostaDoGoogle = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opcoes: Record<string, unknown>) => void;
          renderButton: (
            el: HTMLElement,
            opcoes: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

let carregando: Promise<void> | null = null;
/**
 * O `initialize` do Google é global: um callback só para a página inteira. Ele
 * chama quem estiver montado agora (a tela de login ou a janela do perfil).
 */
let aoCredencial: ((credential: string) => void) | null = null;

function carregarScript() {
  carregando ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }: RespostaDoGoogle) =>
          aoCredencial?.(credential),
        ux_mode: 'popup',
        // nada de entrar sozinho: o botão é um gesto da pessoa
        auto_select: false,
      });
      resolve();
    };
    script.onerror = () => {
      carregando = null;
      reject(new Error('Não foi possível carregar o Google'));
    };
    document.head.appendChild(script);
  });
  return carregando;
}

interface BotaoDoGoogleProps {
  onCredencial: (credential: string) => void;
  /** "Entrar com o Google" no login; "Continuar com o Google" no vínculo */
  texto?: 'signin_with' | 'continue_with';
}

function BotaoDoGoogle({
  onCredencial,
  texto = 'signin_with',
}: BotaoDoGoogleProps) {
  const caixa = useRef<HTMLDivElement>(null);
  const escuro = useTheme().palette.mode === 'dark';
  const aoToken = useRef(onCredencial);
  aoToken.current = onCredencial;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let ativo = true;
    aoCredencial = (credential) => aoToken.current(credential);

    carregarScript()
      .then(() => {
        if (!ativo || !caixa.current || !window.google) return;
        window.google.accounts.id.renderButton(caixa.current, {
          type: 'standard',
          theme: escuro ? 'filled_black' : 'outline',
          size: 'large',
          text: texto,
          shape: 'rectangular',
          logo_alignment: 'center',
          // o Google aceita até 400px e não acompanha a caixa sozinho
          width: Math.min(caixa.current.offsetWidth || 400, 400),
          locale: 'pt-BR',
        });
      })
      // sem o script (bloqueador, rede) o botão some; CPF e senha seguem
      .catch(() => undefined);

    return () => {
      ativo = false;
      aoCredencial = null;
    };
  }, [escuro, texto]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}>
      <Box
        ref={caixa}
        key={escuro ? 'escuro' : 'claro'}
        sx={{ width: '100%', maxWidth: 400 }}
      />
    </Box>
  );
}

export { BotaoDoGoogle };
