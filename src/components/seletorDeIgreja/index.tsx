import { useEffect } from 'react';
import {
  ChurchScopeBar,
  TODAS_AS_IGREJAS,
} from '../../features/settings/shared/churchScopeBar';
import { useIgrejasDoSeletor } from '../../hooks/useIgrejasDoSeletor';

interface SeletorDeIgrejaProps {
  /** a igreja escolhida, ou `'all'` para "Todas as igrejas" */
  value: string;
  onChange: (churchId: string) => void;
  /**
   * Telas que o financeiro também usa (home, eventos) oferecem as igrejas
   * onde ele é financeiro; as de admin (notícias, usuários), só as que a
   * pessoa administra.
   */
  incluirFinanceiro?: boolean;
}

/**
 * O seletor de igreja padrão das listagens — multitenant.
 *
 * Vai sempre no canto superior direito da página, como `children` do
 * `Header`, e tem o mesmo desenho do seletor das Configurações
 * (`ChurchScopeBar`): "Igreja selecionada" seguido do alternador. Um lugar e
 * um desenho só, para ninguém procurar a igreja em cada tela de um jeito.
 *
 * - Super admin e dev escolhem entre todas as igrejas; os demais, entre as
 *   suas (`useIgrejasDoSeletor`).
 * - "Todas as igrejas" (`'all'`) é a primeira opção e o padrão das listagens.
 * - Com uma igreja só não há o que escolher, e o seletor não aparece.
 * - Uma escolha que deixou de valer (igreja apagada, vínculo removido) volta
 *   para "Todas", em vez de esvaziar a lista sem explicação.
 */
function SeletorDeIgreja({
  value,
  onChange,
  incluirFinanceiro = false,
}: SeletorDeIgrejaProps) {
  const { igrejas, mostraSeletor, carregando } = useIgrejasDoSeletor({
    incluirFinanceiro,
  });

  const valida =
    value === TODAS_AS_IGREJAS || igrejas.some((igreja) => igreja.id === value);

  useEffect(() => {
    // enquanto a lista do super admin carrega, a escolha salva é mantida —
    // senão o seletor piscaria para "Todas" e voltaria
    if (!carregando && !valida) onChange(TODAS_AS_IGREJAS);
  }, [carregando, valida, onChange]);

  if (!mostraSeletor && !carregando) return null;

  return (
    <ChurchScopeBar
      todas
      escopo={{
        igrejas,
        churchId: valida ? value : TODAS_AS_IGREJAS,
        escolher: onChange,
        carregando,
        podeTrocar: mostraSeletor,
      }}
    />
  );
}

export { SeletorDeIgreja, TODAS_AS_IGREJAS };
