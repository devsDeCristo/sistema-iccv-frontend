import { useMemo } from 'react';
import {
  ButtonBase,
  Card,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  EditOutlined,
  FamilyRestroom,
  VolunteerActivism,
} from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { MESES_CURTOS } from '../constants';
import { Dizimista } from '../types';
import { CelulaDaFamilia, CelulaDoMembro } from './celulasDoDizimista';
import {
  EmFamilia,
  classeDaFamilia,
  emBlocos,
  estiloDasFamilias,
} from '../../membros/familias';

/** A linha do total da igreja, no fim da tabela */
const TOTAL = '__total__';

type Linha = EmFamilia<Dizimista> & { total?: boolean };

interface Props {
  dizimistas: Dizimista[];
  ano: number;
  /** o total da igreja em cada mês, para a última linha */
  porMesDaIgreja: number[];
  totalDaIgreja: number;
  carregando: boolean;
  /** o lápis da linha: o valor do dízimo do membro */
  onEditar: (dizimista: Dizimista) => void;
  /** a última linha; numa congregação, "Total da congregação" */
  rotuloDoTotal?: string;
}

/**
 * Os dizimistas — os membros da igreja —, cada um numa linha: o valor do
 * dízimo, quanto dizimou em cada mês do ano e o total; a última
 * linha soma a igreja. As famílias ficam juntas, como na tela de Membros.
 * Clicar no valor do dízimo o edita.
 *
 * Família e membro com as mesmas células de `celulasDoDizimista` (foto, nome, CPF).
 * O valor vai com o "R$"; o mês sem dízimo mostra um traço, e o que ainda não chegou fica vazio.
 */
function ListaDizimosPorMes({
  dizimistas,
  ano,
  porMesDaIgreja,
  totalDaIgreja,
  carregando,
  onEditar,
  rotuloDoTotal = 'Total da igreja',
}: Props) {
  const theme = useTheme();

  const agora = new Date();
  // meses que já passaram (ou o corrente): os de depois ficam vazios
  const ultimoMes =
    ano < agora.getFullYear()
      ? 12
      : ano > agora.getFullYear()
        ? 0
        : agora.getMonth() + 1;

  const linhas = useMemo<Linha[]>(() => {
    const blocos = emBlocos(dizimistas);
    if (!blocos.length) return [];
    return [
      ...blocos,
      {
        ...blocos[0],
        id: TOTAL,
        fullName: rotuloDoTotal,
        family: null,
        posicao: null,
        cor: null,
        porMes: porMesDaIgreja,
        totalNoAno: totalDaIgreja,
        total: true,
      },
    ];
  }, [dizimistas, porMesDaIgreja, totalDaIgreja, rotuloDoTotal]);

  const valorDoMes = (valor: number, mes: number, total?: boolean) => {
    if (mes > ultimoMes) return null;
    return (
      <Typography
        fontSize={13}
        fontWeight={total ? 700 : valor ? 600 : 400}
        color={valor ? 'text.primary' : 'text.disabled'}
      >
        {valor ? formatCurrency(valor) : '—'}
      </Typography>
    );
  };

  const columns: GridColDef<Linha>[] = [
    {
      field: 'familia',
      headerName: 'Família',
      // só o ícone: o nome da família fica na dica dele
      description: 'Família',
      renderHeader: () => (
        <FamilyRestroom
          sx={{ fontSize: 18, ml: 1.5, color: 'text.secondary' }}
        />
      ),
      width: 56,
      valueGetter: ({ row }) => row.family?.name ?? '',
      // a linha do total não tem família: nem o traço de "sem família"
      renderCell: ({ row }) =>
        row.total ? null : <CelulaDaFamilia row={row} />,
    },
    {
      field: 'fullName',
      headerName: 'Membro',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) =>
        // a linha do total não é uma pessoa: só o rótulo, em negrito
        row.total ? (
          // a mesma altura das linhas com foto
          <Typography fontSize={14} fontWeight={700} sx={{ py: 2 }}>
            {row.fullName}
          </Typography>
        ) : (
          <CelulaDoMembro row={row} />
        ),
    },
    {
      field: 'titheAmount',
      headerName: 'Dízimo',
      // o cabeçalho curto cabe; a dica explica o que é
      description:
        'Valor do dízimo (clique para mudar). Na importação do banco separa dízimo (este valor) de oferta (outro valor)',
      width: 124,
      align: 'right',
      headerAlign: 'right',
      valueGetter: ({ row }) => (row.total ? null : row.titheAmount),
      // o próprio valor é o botão de editar, com o lápis ao lado
      renderCell: ({ row }) =>
        row.total ? null : (
          <Tooltip title="Mudar o valor do dízimo">
            <ButtonBase
              onClick={() => onEditar(row)}
              sx={{
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                color: row.titheAmount ? 'text.primary' : 'text.disabled',
                '& svg': { opacity: 0.45 },
                '&:hover': { bgcolor: 'action.hover' },
                '&:hover svg': { opacity: 1 },
              }}
            >
              <Typography fontSize={13} color="inherit">
                {row.titheAmount ? formatCurrency(row.titheAmount) : '—'}
              </Typography>
              <EditOutlined sx={{ fontSize: 14 }} />
            </ButtonBase>
          </Tooltip>
        ),
    },
    ...MESES_CURTOS.map((nome, indice): GridColDef<Linha> => ({
      field: `mes${indice + 1}`,
      headerName: nome,
      // cabe "R$ 12.345,67" (o total da igreja, em negrito)
      width: 108,
      align: 'right',
      headerAlign: 'right',
      // a exportação leva o número, não o texto da célula
      valueGetter: ({ row }) => row.porMes[indice],
      renderCell: ({ row }) =>
        valorDoMes(row.porMes[indice], indice + 1, row.total),
    })),
    {
      field: 'totalNoAno',
      headerName: 'Total',
      width: 115,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Typography fontSize={13} fontWeight={700}>
          {formatCurrency(row.totalNoAno)}
        </Typography>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={linhas}
        columns={columns.map((coluna) => ({
          ...coluna,
          sortable: false,
          disableColumnMenu: true,
        }))}
        loading={carregando}
        // a mesma altura da visão por ano: a foto do membro define a linha
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        columnHeaderHeight={44}
        getRowClassName={({ row }) =>
          row.total ? 'linha-total' : classeDaFamilia(row.cor)
        }
        sx={{
          ...dataGridSx(theme),
          ...estiloDasFamilias(60),
          // o total da igreja se destaca: fundo e uma linha acima dele
          '& .linha-total': {
            backgroundColor: alpha(theme.palette.text.primary, 0.05),
            borderTop: `2px solid ${theme.palette.divider}`,
          },
        }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        slots={{
          noRowsOverlay: () => (
            <Stack
              height="100%"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              py={5}
            >
              <VolunteerActivism
                sx={{ fontSize: 34, color: 'text.disabled' }}
              />
              <Typography color="text.secondary">
                Nenhum membro nesta igreja ainda
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDizimosPorMes };
