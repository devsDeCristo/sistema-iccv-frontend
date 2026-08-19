import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

interface ExternalWindowProps {
  open: boolean;
  /** Título da janela */
  title: string;
  /** Nome usado pelo navegador para reaproveitar a mesma janela */
  name?: string;
  features?: string;
  /** A janela foi fechada — pelo botão do navegador ou junto com a principal */
  onClose: () => void;
  /** O navegador bloqueou o pop-up */
  onBlocked?: () => void;
  children: ReactNode;
}

/** A janela nasce vazia, sem nada do index.html: o mínimo para não ficar feia. */
const BASE_CSS = `
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: #ffffff;
    color: #111B21;
    font-family: Roboto, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;

/**
 * Renderiza `children` em outra janela do navegador, pela mesma árvore React de
 * quem a abriu: o conteúdo acompanha o estado sem nenhuma sincronização e
 * objetos vivos — o MediaStream da webcam, por exemplo — valem nos dois lados.
 *
 * Componentes do MUI funcionam aqui dentro porque a janela ganha o próprio
 * cache do emotion, apontado para o `head` dela; sem isso o CSS seria escrito
 * na janela principal e este conteúdo apareceria sem estilo nenhum.
 */
function ExternalWindow({
  open,
  title,
  name = 'painel',
  features = 'width=1280,height=800',
  onClose,
  onBlocked,
  children,
}: ExternalWindowProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [cache, setCache] = useState<EmotionCache | null>(null);
  const onCloseRef = useRef(onClose);
  const onBlockedRef = useRef(onBlocked);

  onCloseRef.current = onClose;
  onBlockedRef.current = onBlocked;

  useEffect(() => {
    if (!open) return;

    const janela = window.open('', name, features);

    if (!janela) {
      onBlockedRef.current?.();
      onCloseRef.current();
      return;
    }

    const documento = janela.document;
    documento.title = title;
    // reabrir a mesma janela reaproveita o documento; limpa o que sobrou
    documento.head.innerHTML = '';
    documento.body.innerHTML = '';

    const estilo = documento.createElement('style');
    estilo.textContent = BASE_CSS;
    documento.head.appendChild(estilo);

    setCache(
      createCache({ key: 'janela', container: documento.head, prepend: true })
    );
    setContainer(documento.body);

    const fecharJanela = () => janela.close();
    const avisarFechamento = () => onCloseRef.current();

    janela.addEventListener('beforeunload', avisarFechamento);
    // ninguém deve ficar com um painel órfão se a tela do operador sumir
    window.addEventListener('beforeunload', fecharJanela);
    // fechar pelo X nem sempre dispara beforeunload
    const vigia = window.setInterval(() => {
      if (janela.closed) onCloseRef.current();
    }, 1000);

    return () => {
      window.clearInterval(vigia);
      janela.removeEventListener('beforeunload', avisarFechamento);
      window.removeEventListener('beforeunload', fecharJanela);
      setContainer(null);
      setCache(null);
      janela.close();
    };
  }, [open, name, features, title]);

  if (!open || !container || !cache) return null;

  return createPortal(
    <CacheProvider value={cache}>{children}</CacheProvider>,
    container
  );
}

export { ExternalWindow };
