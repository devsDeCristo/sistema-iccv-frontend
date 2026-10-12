import { ReactElement, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  AccountBalanceWallet,
  SwapVert,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';

import { NavTabs } from '../../../../../components/navTabs';
import { StatusCards } from '../../../../../components/statusCards';
import { formatCurrency } from '../../../../../utils';
import {
  LancamentoDaTesouraria,
  porCategoria,
  resumir,
  TipoDoLancamento,
} from '../dados';
import { ResumoPorCategoria } from './resumoPorCategoria';
import { TabelaDaTesouraria } from './tabelaDaTesouraria';

interface Props {
  lancamentos: LancamentoDaTesouraria[];
  /** A legenda dos cards de entradas e saídas: "No evento", "Em 2026" */
  periodo: string;
  /** O quarto card: a categoria que importa nesta tesouraria */
  destaque: { categoria: string; legenda: string; icone: ReactElement };
}

/**
 * Os lançamentos de uma tesouraria de evento ou de congregação: o resultado,
 * para onde foi o dinheiro por categoria, e cada lançamento na tabela.
 */
function LancamentosDaTesouraria({ lancamentos, periodo, destaque }: Props) {
  const theme = useTheme();
  const [filtro, setFiltro] = useState<'TODOS' | TipoDoLancamento>('TODOS');

  const resumo = resumir(lancamentos);
  const doDestaque = lancamentos
    .filter((l) => l.categoria === destaque.categoria)
    .reduce((soma, l) => soma + l.valor, 0);
  const visiveis =
    filtro === 'TODOS'
      ? lancamentos
      : lancamentos.filter((l) => l.tipo === filtro);
  const quantos = (tipo: TipoDoLancamento) =>
    lancamentos.filter((l) => l.tipo === tipo).length;

  return (
    <>
      <StatusCards
        cards={[
          {
            title: 'Entradas',
            value: formatCurrency(resumo.entradas),
            subtitle: periodo,
            icon: <TrendingUp sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.success,
            compact: true,
          },
          {
            title: 'Saídas',
            value: formatCurrency(resumo.saidas),
            subtitle: periodo,
            icon: <TrendingDown sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.canceled,
            compact: true,
          },
          {
            title: 'Resultado',
            value: formatCurrency(resumo.saldo),
            subtitle: 'Entradas menos saídas',
            icon: <AccountBalanceWallet sx={{ fontSize: 20 }} />,
            color:
              resumo.saldo < 0
                ? theme.palette.chips.canceled
                : theme.palette.chips.info,
            compact: true,
          },
          {
            title: destaque.categoria,
            value: formatCurrency(doDestaque),
            subtitle: destaque.legenda,
            icon: destaque.icone,
            color: theme.palette.chips.alert,
            compact: true,
          },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <ResumoPorCategoria
          tipo="INCOME"
          itens={porCategoria(lancamentos, 'INCOME')}
        />
        <ResumoPorCategoria
          tipo="EXPENSE"
          itens={porCategoria(lancamentos, 'EXPENSE')}
        />
      </Box>

      <NavTabs
        value={filtro}
        onChange={setFiltro}
        options={[
          {
            value: 'TODOS',
            label: `Todos (${lancamentos.length})`,
            icon: <SwapVert fontSize="small" />,
          },
          {
            value: 'INCOME',
            label: `Entradas (${quantos('INCOME')})`,
            icon: <TrendingUp fontSize="small" />,
          },
          {
            value: 'EXPENSE',
            label: `Saídas (${quantos('EXPENSE')})`,
            icon: <TrendingDown fontSize="small" />,
          },
        ]}
        fullWidth
        sx={{ mb: 1.5 }}
      />
      <TabelaDaTesouraria lancamentos={visiveis} />
    </>
  );
}

export { LancamentosDaTesouraria };
