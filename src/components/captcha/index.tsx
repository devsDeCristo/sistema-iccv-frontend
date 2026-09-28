import { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

/**
 * Captcha do login: Cloudflare Turnstile, carregado direto da Cloudflare.
 *
 * Turnstile e não reCAPTCHA: o gratuito do Google caiu para 10 mil verificações
 * por mês em 2026, e o Turnstile não tem esse teto.
 *
 * Sem `VITE_TURNSTILE_SITE_KEY` não renderiza nada: o servidor, sem a chave
 * secreta correspondente, também não exige o captcha.
 */
export const CAPTCHA_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  string | undefined;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opcoes: Record<string, unknown>) => string;
    };
    aoCarregarTurnstile?: () => void;
  }
}

let carregando: Promise<void> | null = null;

/** O script entra uma vez só, na primeira tela que precisar dele. */
function carregarScript() {
  carregando ??= new Promise<void>((resolve) => {
    window.aoCarregarTurnstile = resolve;
    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=aoCarregarTurnstile&render=explicit';
    script.async = true;
    document.head.appendChild(script);
  });
  return carregando;
}

interface CaptchaProps {
  /** token quando a verificação passa; `null` quando ela expira ou falha */
  onToken: (token: string | null) => void;
}

/**
 * Cada token vale uma tentativa só: para pedir outro, quem usa troca a `key`
 * do componente, que remonta o desafio do zero.
 */
function Captcha({ onToken }: CaptchaProps) {
  const caixa = useRef<HTMLDivElement>(null);
  const escuro = useTheme().palette.mode === 'dark';
  const aoToken = useRef(onToken);
  aoToken.current = onToken;

  useEffect(() => {
    if (!CAPTCHA_SITE_KEY) return;
    let ativo = true;

    carregarScript().then(() => {
      if (!ativo || !caixa.current || !window.turnstile) return;
      window.turnstile.render(caixa.current, {
        sitekey: CAPTCHA_SITE_KEY,
        theme: escuro ? 'dark' : 'light',
        language: 'pt-br',
        callback: (token: string) => aoToken.current(token),
        'expired-callback': () => aoToken.current(null),
        'error-callback': () => aoToken.current(null),
      });
    });

    return () => {
      ativo = false;
    };
  }, [escuro]);

  if (!CAPTCHA_SITE_KEY) return null;

  // o widget tem largura fixa (300px): centralizado, não estoura no celular
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <div ref={caixa} key={escuro ? 'escuro' : 'claro'} />
    </Box>
  );
}

export { Captcha };
