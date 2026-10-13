import { useEffect } from 'react';
import {
  ChurchScopeBar,
  TODAS_AS_IGREJAS,
} from '../../features/settings/shared/churchScopeBar';
import { useIgrejasDoSeletor } from '../../hooks/useIgrejasDoSeletor';
import { useRole } from '../../hooks/useRole';

interface SeletorDeIgrejaProps {
  /** a igreja escolhida, ou `'all'` para a visão DEV (sistema) */
  value: string;
  onChange: (churchId: string) => void;
}

/** O rótulo da visão sem igreja: o sistema, de quem cuida dele */
const VISAO_DEV = 'DEV';

/**
 * O seletor de igreja da home do painel.
 *
 * As telas dos módulos são sempre de **uma** igreja, a escolhida, e mostram
 * exatamente o que o admin dela vê (`useIgrejaSelecionada` + `ChurchScopeBar`).
 * A home é a exceção por ser também a do dev e do super admin: para eles há a
 * opção **DEV**, a visão do sistema (`'all'`), que é o padrão deles. Quem
 * trabalha em igreja escolhe uma das suas — com uma só, ela vem sozinha, e
 * com várias a home pede a escolha.
 *
 * Uma escolha que deixou de valer (igreja apagada, vínculo removido) volta
 * para DEV, para quem tem, ou para nenhuma.
 */
function SeletorDeIgreja({ value, onChange }: SeletorDeIgrejaProps) {
  const { isSuperAdmin } = useRole();
  const { igrejas, carregando } = useIgrejasDoSeletor({
    incluirTesouraria: true,
  });

  const valida =
    (isSuperAdmin && value === TODAS_AS_IGREJAS) ||
    igrejas.some((igreja) => igreja.id === value);
  const padrao = isSuperAdmin
    ? TODAS_AS_IGREJAS
    : igrejas.length === 1
      ? igrejas[0].id
      : '';

  useEffect(() => {
    // enquanto a lista do super admin carrega, a escolha salva é mantida
    if (!carregando && !valida && value !== padrao) onChange(padrao);
  }, [carregando, valida, value, padrao, onChange]);

  // com uma igreja só e sem a visão DEV não há o que escolher
  if (!isSuperAdmin && igrejas.length <= 1 && !carregando) return null;

  return (
    <ChurchScopeBar
      todas={isSuperAdmin ? VISAO_DEV : undefined}
      escopo={{
        igrejas,
        churchId: valida ? value : null,
        escolher: onChange,
        carregando,
        podeTrocar: true,
      }}
    />
  );
}

export { SeletorDeIgreja, TODAS_AS_IGREJAS };
