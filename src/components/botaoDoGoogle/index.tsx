import { useEffect, useRef, useState } from 'react';
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

/** O "G" de quatro cores, como manda o guia de marca do Google */
function LogoDoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/** Tamanho em que o botão oficial é desenhado (`size: 'large'`, largura máxima) */
const LARGURA_OFICIAL = 400;
const ALTURA_OFICIAL = 40;
/** A mesma altura do "Entrar" do login */
const ALTURA = 46;

interface BotaoDoGoogleProps {
  onCredencial: (credential: string) => void;
  /** "Entrar com Google" no login; "Continuar com Google" no vínculo */
  texto?: 'signin_with' | 'continue_with';
}

/**
 * O botão oficial é um iframe do Google, que o CSS da página não alcança: não
 * dá para deixá-lo com a cara do sistema. Então o que se vê é o nosso botão, e
 * o oficial fica por cima dele, transparente e esticado até cobrir tudo — é
 * nele que o clique acontece, e o fluxo segue sendo o do Google. O nosso fica
 * fora do alcance do mouse e do leitor de tela; quem recebe foco e anuncia o
 * botão é o do Google.
 */
function BotaoDoGoogle({
  onCredencial,
  texto = 'signin_with',
}: BotaoDoGoogleProps) {
  const theme = useTheme();
  const moldura = useRef<HTMLDivElement>(null);
  const oficial = useRef<HTMLDivElement>(null);
  const [carregou, setCarregou] = useState(false);
  const [largura, setLargura] = useState(LARGURA_OFICIAL);
  const aoToken = useRef(onCredencial);
  aoToken.current = onCredencial;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let ativo = true;
    aoCredencial = (credential) => aoToken.current(credential);

    carregarScript()
      .then(() => {
        if (!ativo || !oficial.current || !window.google) return;
        window.google.accounts.id.renderButton(oficial.current, {
          type: 'standard',
          size: 'large',
          text: texto,
          width: LARGURA_OFICIAL,
          locale: 'pt-BR',
        });
        setCarregou(true);
      })
      // sem o script (bloqueador, rede) o botão some; CPF e senha seguem
      .catch(() => undefined);

    return () => {
      ativo = false;
      aoCredencial = null;
    };
  }, [texto]);

  // o oficial tem largura fixa: acompanha a moldura quando a tela muda
  useEffect(() => {
    if (!moldura.current) return;
    const observador = new ResizeObserver(([entrada]) =>
      setLargura(entrada.contentRect.width)
    );
    observador.observe(moldura.current);
    return () => observador.disconnect();
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <Box
      ref={moldura}
      sx={{
        position: 'relative',
        height: ALTURA,
        display: carregou ? 'block' : 'none',
        borderRadius: 1,
        '&:hover .botao-visual': {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.text.secondary,
        },
        '&:focus-within': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        className="botao-visual"
        aria-hidden
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          fontSize: '0.9375rem',
          fontWeight: 600,
          letterSpacing: '0.2px',
          transition: theme.transitions.create([
            'background-color',
            'border-color',
          ]),
        }}
      >
        <LogoDoGoogle />
        {texto === 'signin_with' ? 'Entrar com Google' : 'Continuar com Google'}
      </Box>

      <Box
        ref={oficial}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: LARGURA_OFICIAL,
          height: ALTURA_OFICIAL,
          overflow: 'hidden',
          // transparente, mas clicável: opacidade 0 ainda recebe o clique
          opacity: 0.0001,
          transformOrigin: '0 0',
          transform: `scale(${largura / LARGURA_OFICIAL}, ${
            ALTURA / ALTURA_OFICIAL
          })`,
        }}
      />
    </Box>
  );
}

export { BotaoDoGoogle };
