import { Id, toast } from 'react-toastify';
import { apiClient } from '../config/lib/axios/api-client';

/** O que o servidor diz do pedido — ver `src/pdf/fila.ts` no backend */
type SituacaoNaFila =
  | { estado: 'fila'; posicao: number }
  | { estado: 'gerando' }
  | { estado: 'desconhecido' };

/** De quanto em quanto tempo a tela pergunta a posição */
const INTERVALO_MS = 1500;

const esperar = (ms: number) =>
  new Promise((resolver) => setTimeout(resolver, ms));

/**
 * Pede um PDF que o servidor gera numa fila (quadrante, crachás): um de cada
 * vez, porque dois ao mesmo tempo estouravam a memória do container.
 *
 * Sorteia um código para o pedido e manda em `X-Pedido-Pdf`; enquanto o PDF
 * não chega, pergunta a posição desse código e mostra num aviso — "Você está
 * na fila: 2º lugar", e depois "Sua vez! Gerando o PDF…". Sem ninguém na
 * frente o aviso nem aparece. Ele some quando o pedido termina, dê certo ou
 * não.
 *
 * `pedir` recebe os cabeçalhos a mandar junto com o pedido do PDF.
 */
export async function pedirPdfNaFila<T>(
  pedir: (cabecalhos: Record<string, string>) => Promise<T>
): Promise<T> {
  const pedido = crypto.randomUUID();
  let ativo = true;
  let aviso: Id | null = null;

  const mostrar = (texto: string) => {
    if (aviso === null) {
      aviso = toast.info(texto, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    } else {
      toast.update(aviso, { render: texto });
    }
  };

  const acompanhar = async () => {
    while (ativo) {
      await esperar(INTERVALO_MS);
      if (!ativo) return;
      try {
        const { data } = await apiClient.get<SituacaoNaFila>(
          `/pdf/fila/${pedido}`
        );
        if (!ativo) return;

        if (data.estado === 'fila') {
          mostrar(
            `Você está na fila para gerar o PDF: ${data.posicao}º lugar. ` +
              'Ele começa assim que chegar a sua vez.'
          );
        } else if (data.estado === 'gerando' && aviso !== null) {
          // só troca o aviso de quem esperou; quem não esperou não viu nada
          mostrar('Sua vez! Gerando o PDF…');
        }
      } catch {
        // a posição é só informativa: falhar aqui não atrapalha o PDF
      }
    }
  };

  acompanhar();

  try {
    return await pedir({ 'X-Pedido-Pdf': pedido });
  } finally {
    ativo = false;
    if (aviso !== null) toast.dismiss(aviso);
  }
}
