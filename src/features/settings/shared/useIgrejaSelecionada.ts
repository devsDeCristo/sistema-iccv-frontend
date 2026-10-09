import { useMemo } from 'react';
import { useIgrejaEscolhida } from '../../../hooks/useIgrejaEscolhida';
import { useRole } from '../../../hooks/useRole';
import { useGetChurches } from '../../admin/churches/api/getChurches';

export interface IgrejaDoPainel {
  id: string;
  name: string;
}

export interface EscopoDeIgreja {
  igrejas: IgrejaDoPainel[];
  churchId: string | null;
  escolher: (churchId: string) => void;
  carregando: boolean;
  /** Há mais de uma para escolher — só aí o seletor faz sentido */
  podeTrocar: boolean;
  /** A pessoa não administra igreja nenhuma: não há o que configurar */
  semIgreja: boolean;
  /**
   * Há mais de uma e nenhuma foi escolhida ainda: a tela pede a escolha em
   * vez de mostrar a configuração de uma igreja que ninguém escolheu
   */
  precisaEscolher: boolean;
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

  // A mesma escolha de todos os módulos (`useIgrejaEscolhida`, no
  // `localStorage`): quem escolheu a Filial em Notícias abre Pagamentos e
  // WhatsApp já na Filial. "Todas as igrejas" não serve aqui — a configuração
  // é sempre de uma —, e então a tela pede a escolha.
  const [escolhida, setEscolhida] = useIgrejaEscolhida();

  // A escolha guardada só vale enquanto a igreja continuar na lista: um vínculo
  // removido deixaria a tela presa numa igreja que a API recusa.
  //
  // Sem escolha, só a igreja única vale sozinha. Com várias, nada é deduzido:
  // a tela começava na primeira da lista, e o super admin pareava o número ou
  // cadastrava a conta de recebimento na igreja errada sem perceber.
  const churchId =
    igrejas.find((igreja) => igreja.id === escolhida)?.id ??
    (igrejas.length === 1 ? igrejas[0].id : null);

  const escolher = (id: string) => setEscolhida(id);

  const carregando = isSuperAdmin && isLoading;

  return {
    igrejas,
    churchId,
    escolher,
    carregando,
    podeTrocar: igrejas.length > 1,
    semIgreja: !carregando && igrejas.length === 0,
    precisaEscolher: !carregando && igrejas.length > 1 && !churchId,
  };
}
