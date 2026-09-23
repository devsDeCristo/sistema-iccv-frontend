import { useEffect, useState } from 'react';
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
 */
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

  useEffect(() => {
    try {
      localStorage.setItem(chaveCompleta, JSON.stringify(valor));
    } catch {
      // sem armazenamento, o filtro só não é lembrado
    }
  }, [chaveCompleta, valor]);

  return [valor, setValor] as const;
}
