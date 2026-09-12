import { useMemo, useState } from 'react';
import { useRole } from '../../../hooks/useRole';
import { useGetChurches } from '../../admin/churches/api/getChurches';

export interface IgrejaDoPainel {
  id: string;
  name: string;
}

/**
 * Onde fica guardada a igreja escolhida.
 *
 * `sessionStorage` e não estado da tela: Pagamentos e Disparadores são duas
 * páginas, e sem isto trocar de aba voltaria para a primeira igreja da lista —
 * quem administra várias teria que reescolher a cada clique. Some ao fechar a
 * aba, que é o certo para um recorte de trabalho: na sessão seguinte a pessoa
 * não herda um contexto que já não lembra ter escolhido.
 */
const CHAVE = 'configuracoes_igreja';

export interface EscopoDeIgreja {
  igrejas: IgrejaDoPainel[];
  churchId: string | null;
  escolher: (churchId: string) => void;
  carregando: boolean;
  /** Há mais de uma para escolher — só aí o seletor faz sentido */
  podeTrocar: boolean;
  /** A pessoa não administra igreja nenhuma: não há o que configurar */
  semIgreja: boolean;
}

/**
 * Qual igreja está sendo configurada.
 *
 * A pergunta é obrigatória nas telas de configuração porque tudo o que elas
 * guardam é por igreja — a conta que recebe o dinheiro e o número que dispara
 * o aviso. Quem administra uma só nem percebe: a escolha é feita por ela.
 *
 * Super admin e dev não têm vínculo com igreja nenhuma e enxergam todas, então
 * para eles a lista vem da listagem de igrejas. Para o admin, vem dos próprios
 * vínculos — e é a mesma lista que a API aceita, então a tela não oferece uma
 * igreja que o `ChurchTenantGuard` vai recusar depois.
 */
export function useIgrejaSelecionada(): EscopoDeIgreja {
  const { isSuperAdmin, igrejasQueAdministra } = useRole();

  const { data: todasAsIgrejas, isLoading } = useGetChurches({
    enabled: isSuperAdmin,
  });

  const igrejas = useMemo<IgrejaDoPainel[]>(
    () =>
      isSuperAdmin
        ? (todasAsIgrejas ?? []).map(({ id, name }) => ({ id, name }))
        : igrejasQueAdministra,
    [isSuperAdmin, todasAsIgrejas, igrejasQueAdministra]
  );

  const [escolhida, setEscolhida] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(CHAVE);
    } catch {
      // navegador com armazenamento bloqueado: cai no padrão da lista
      return null;
    }
  });

  // A escolha guardada só vale enquanto a igreja continuar na lista: um vínculo
  // removido deixaria a tela presa numa igreja que a API recusa.
  const churchId =
    igrejas.find((igreja) => igreja.id === escolhida)?.id ??
    igrejas[0]?.id ??
    null;

  const escolher = (id: string) => {
    setEscolhida(id);
    try {
      sessionStorage.setItem(CHAVE, id);
    } catch {
      // sem persistir: a escolha vale só nesta tela, e isso é melhor que falhar
    }
  };

  const carregando = isSuperAdmin && isLoading;

  return {
    igrejas,
    churchId,
    escolher,
    carregando,
    podeTrocar: igrejas.length > 1,
    semIgreja: !carregando && igrejas.length === 0,
  };
}
