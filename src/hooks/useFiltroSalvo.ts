import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getStoredUser } from '../auth/session';

/**
 * Um `useState` que sobrevive a sair da tela e recarregar a página.
 *
 * A chave leva o id de quem está logado: o logout não apaga filtros (só as
 * chaves da sessão), e no computador da secretaria quem entra depois não deve
 * herdar a igreja que a pessoa anterior deixou escolhida.
 *
 * `valido` descarta o que não serve mais — um status que deixou de existir, ou
 * algo gravado à mão no navegador — e volta para o valor inicial.
 *
 * O `try` é porque o `localStorage` pode não existir (aba anônima com
 * armazenamento bloqueado): aí o filtro só não é lembrado, a tela segue igual.
 *
 * Duas telas abertas com a mesma chave andam juntas: quem grava avisa as
 * outras (`EVENTO`), e elas releem. É o que deixa a igreja escolhida num
 * seletor valer na hora para o guarda da rota, que também a lê.
 */
const EVENTO = 'filtro-salvo';

export function useFiltroSalvo<T>(
  chave: string,
  inicial: T,
  valido: (valor: unknown) => valor is T = (_valor): _valor is T => true
) {
  const chaveCompleta = `filtros:${getStoredUser()?.id ?? 'anonimo'}:${chave}`;

  const [valor, setValor] = useState<T>(() => {
    try {
      const salvo = localStorage.getItem(chaveCompleta);
      if (salvo === null) return inicial;

      const lido: unknown = JSON.parse(salvo);
      return valido(lido) ? lido : inicial;
    } catch {
      return inicial;
    }
  });

  /**
   * Grava na hora, e não num efeito depois de renderizar: quem troca e navega
   * no mesmo clique (o sininho, as pendências da home) monta a tela de destino
   * — e o guarda dela — lendo daqui. Gravando só no efeito, ela nascia com a
   * igreja antiga e às vezes perdia o aviso, que saía antes de ela ouvir.
   */
  const atual = useRef(valor);
  atual.current = valor;
  const definir = useCallback(
    (acao: SetStateAction<T>) => {
      const novo = acao instanceof Function ? acao(atual.current) : acao;
      atual.current = novo;
      setValor(novo);
      try {
        const texto = JSON.stringify(novo);
        // só avisa quando mudou de fato: sem isto as telas se avisariam sem fim
        if (localStorage.getItem(chaveCompleta) === texto) return;
        localStorage.setItem(chaveCompleta, texto);
        window.dispatchEvent(
          new CustomEvent(EVENTO, { detail: chaveCompleta })
        );
      } catch {
        // sem armazenamento, o filtro só não é lembrado
      }
    },
    [chaveCompleta]
  );

  useEffect(() => {
    const aoMudar = (evento: Event) => {
      if ((evento as CustomEvent<string>).detail !== chaveCompleta) return;
      try {
        const lido: unknown = JSON.parse(
          localStorage.getItem(chaveCompleta) ?? 'null'
        );
        if (valido(lido)) setValor(lido);
      } catch {
        // valor ilegível: fica o que esta tela já tinha
      }
    };
    window.addEventListener(EVENTO, aoMudar);
    return () => window.removeEventListener(EVENTO, aoMudar);
  }, [chaveCompleta, valido]);

  return [valor, definir] as const;
}
